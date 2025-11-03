import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../appConfig";
import store from "../store";
import { addMessage } from "../slices/messaging/messageSlice";
import { fetchConversations } from "../thunks/messaging/fetchConversationsThunk";
import { DEVELOPER_MODE } from "../appConfig";
import { updateConversationPreview } from "../slices/messaging/conversationsSlice";
import { setSocketConnected } from "../slices/socket/socketSlice";
import { type MessageData } from "../types/messageType";
import { addNotification, incrementUnreadCount, type NotificationData } from "../slices/notification/notificationSlice";

// Define the shape of server-to-client events
interface ServerToClientEvents {
    connect: () => void;
    disconnect: (reason: string) => void;
    connect_error: (error: Error & { data?: any }) => void;
    error: (errorData: { message: string }) => void;
    status: (statusData: { message: string }) => void;
    new_message: (message: MessageData) => void;
    new_notification: (notification: NotificationData) => void;
}

// Define the shape of client-to-server events
interface ClientToServerEvents {
    send_message: (data: { conversation_id: string; content: string }) => void;
}

// --- Socket Instance Holder ---
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

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
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket']
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

    socket.on("disconnect", (reason) => {
        DEVELOPER_MODE && console.log("Socket disconnected:", reason);
        store.dispatch(setSocketConnected(false));
        // Handle disconnect reasons, e.g., 'io server disconnect' might mean forceful disconnect
        if (reason === "io server disconnect") {
            // Potentially handle as logout or show message
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
        // Potentially show error messages to the user via toast/notification
    });

    socket.on("status", (statusData) => {
        DEVELOPER_MODE && console.log("Received status event from server:", statusData.message);
        // Handle status updates (e.g., confirming room join)
    });

    socket.on("new_notification", (notification: NotificationData) => {
        DEVELOPER_MODE && console.log("Received new_notification event:", notification);
        
        // 1. Dispatch to add the notification to the top of the list
        store.dispatch(addNotification(notification));

        // 2. Dispatch to increment the unread count in the slice
        store.dispatch(incrementUnreadCount());
    });

    socket.on("new_message", (message: MessageData) => {
        DEVELOPER_MODE && console.log("Received new_message event:", message);

        const state = store.getState();
        const activeId = state.messages.activeConversationId;
        const allConversations = state.conversations.conversations;
        const convoExists = allConversations.some(c => c.id === message.conversationId);

        if (message.conversationId === activeId) {
            store.dispatch(addMessage(message));
        }

        if (convoExists) {
            store.dispatch(updateConversationPreview({
                conversationId: message.conversationId,
                message: {
                    content: message.content,
                    senderUsername: message.sender.username,
                    createdAt: message.createdAt
                },
                isNewUnreadMessage: message.conversationId !== activeId
            }));
        } else {
            // We've never seen this chat before. It's a brand new conversation.
            // We must fetch the whole list again to get its details (name, image, etc.)

            // Only fetch if we're not already fetching
            if (state.conversations.loading !== 'pending') {
                DEVELOPER_MODE && console.log("New conversation detected, fetching list...");
                store.dispatch(fetchConversations());
            }
        }

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

/**
 * Emits an event via the socket connection.
 * Use this function from your components or thunks to send events.
 * @param eventName The name of the event to emit.
 * @param data The data payload for the event.
 */
export const emitSocketEvent = (eventName: keyof ClientToServerEvents, data: any): void => {
    if (socket?.connected) {
        socket.emit(eventName, data);
    } else {
        DEVELOPER_MODE && console.error(`Socket not connected. Cannot emit event '${eventName}'. socket: ${socket}`);
        // Optionally handle reconnection attempt or error feedback here
    }
}

// Optional: Export the raw socket instance if needed, but prefer using emitSocketEvent
export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> | null => {
    return socket;
}