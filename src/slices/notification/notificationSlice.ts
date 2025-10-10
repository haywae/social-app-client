import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { fetchNotifications, type PaginatedNotificationsResponse } from "../../thunks/notificationThunks/notificationListThunk";
import { markNotificationsAsRead } from "../../thunks/notificationThunks/notificationAsReadThunk";

// This interface now perfectly matches your backend's serialized object
export interface NotificationData {
    id: string;
    type: 'like' | 'comment' | 'follow' | 'mention';
    isRead: boolean;
    createdAt: string;
    fromUser: {
        username: string;
        displayName: string;
        avatarUrl: string;
    };
    post?: {
        id: string;
        content: string;
    };
    comment?: {
        id: string;
        content: string;
        postId: string;
    };
}

export interface NotificationsState {
    notifications: NotificationData[];
    unreadCount: number;
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error: string | null;
    currentPage: number;
    hasMore: boolean; // To know when to stop fetching
}

const initialState: NotificationsState = {
    notifications: [],
    unreadCount: 0,
    loading: 'idle',
    error: null,
    currentPage: 0,
    hasMore: true,
};

const notificationsSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        clearNotifications: (state) => {
            Object.assign(state, initialState);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<PaginatedNotificationsResponse>) => {
                state.loading = 'succeeded';
                // CASE 1: The fetched page is the first page 
                if (action.payload.currentPage === 1) {
                    state.notifications = action.payload.notifications;
                } else {
                    // CASE 2: The fetched page is not the first page
                    // Attaches only the notifications that do not already exist
                    const newNotifications = action.payload.notifications.filter(
                        (newNotif) => !state.notifications.some((existingNotif) => existingNotif.id === newNotif.id)
                    );
                    state.notifications.push(...newNotifications);
                }
                state.unreadCount = action.payload.unreadCount;
                state.currentPage = action.payload.currentPage;
                state.hasMore = action.payload.currentPage < action.payload.totalPages;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload ?? 'Could not fetch notifications.';
            })
            .addCase(markNotificationsAsRead.fulfilled, (state, action) => {
                // 1. Update the unread count from the API response (will be 0)
                state.unreadCount = action.payload.unreadCount;
                // 2. Mark all notifications currently in the state as read for an instant UI update
                state.notifications.forEach(notification => {
                    notification.isRead = true;
                });
            });
    }
});

export const { clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;