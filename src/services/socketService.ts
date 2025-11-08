import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../appConfig";
import store from "../store";
import { DEVELOPER_MODE } from "../appConfig";
import { setSocketConnected } from "../slices/socket/socketSlice";
import { addNotification, incrementUnreadCount, type NotificationData } from "../slices/notification/notificationSlice";
import { setSuccess } from "../slices/ui/uiSlice";

// Define the shape of server-to-client events
interface ServerToClientEvents {
    connect: () => void;
    disconnect: (reason: string) => void;
    connect_error: (error: Error & { data?: any }) => void;
    error: (errorData: { message: string }) => void;
    status: (statusData: { message: string }) => void;
    new_notification: (notification: NotificationData) => void;
    welcome: (data: {message: string}) => void;
}

// --- Socket Instance Holder ---
let socket: Socket<ServerToClientEvents> | null = null;

/**
 * Establishes the Socket.IO connection.
 * Should be called after user is authenticated and token is available.
 * @param authToken - The user's JWT authentication token.
 */
export const connectSocket = (): void => {
    // Prevent multiple connections
    if (socket?.connected) {
        DEVELOPER_MODE && console.log("Socket already connected.");
        return;
    }

    // If a socket instance exists but isn't connected, try disconnecting first
    if (socket) {
        socket.disconnect();
        socket = null
    }

    DEVELOPER_MODE && console.log("Attempting to connect socket...");

    // Initialize connection with URL and auth token
    socket = io(SOCKET_URL, {
        withCredentials: true,
        reconnection: true,

    });

    // --------------------------------
    // --- STANDARD EVENT LISTENERS ---
    // --------------------------------

    // -------------------
    // --- Connection ----
    // -------------------
    socket.on("connect", () => {
        DEVELOPER_MODE && console.log("Socket connected:", socket?.id);
        store.dispatch(setSocketConnected(true));
    });
    socket.on('welcome', (data) => {
        store.dispatch(setSuccess(data.message))
    });
    socket.on("disconnect", (reason) => {
        DEVELOPER_MODE && console.log("Socket disconnected:", reason);
        store.dispatch(setSocketConnected(false));
        if (reason === "io server disconnect") {
        }
    });

    socket.on("connect_error", async (error) => {
        DEVELOPER_MODE && console.error("Socket connection error:", error.message, error.stack || '(No data)');
        store.dispatch(setSocketConnected(false));
    });

    // ------------------------------------------
    // --- Custom Application Event Listeners ---
    // ------------------------------------------

    socket.on("error", (errorData) => {
        DEVELOPER_MODE && console.error("Received error event from server:", errorData.message);
    });

    socket.on("status", (statusData) => {
        DEVELOPER_MODE && console.log("Received status event from server:", statusData.message);
    });

    socket.on("new_notification", (notification: NotificationData) => {
        DEVELOPER_MODE && console.log("Received new_notification event:", notification);
        
        // 1. Dispatch to add the notification to the top of the list
        store.dispatch(addNotification(notification));

        // 2. Dispatch to increment the unread count in the slice
        store.dispatch(incrementUnreadCount());
    });
};

/**
 * Disconnects the Socket.IO connection.
 * Should be called on user logout.
 */
export const disconnectSocket = (): void => {
    if (socket) {
        DEVELOPER_MODE && console.log("Disconnecting socket...");
        socket.disconnect();
        store.dispatch(setSocketConnected(false));
    }
};


export const getSocket = (): Socket<ServerToClientEvents> | null => {
    return socket;
}