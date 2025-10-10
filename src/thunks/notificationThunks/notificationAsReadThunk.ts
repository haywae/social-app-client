import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";


// 1. Define the shape of the arguments the thunk will receive
interface MarkAsReadArgs {
    notificationIds?: string[];
}

interface MarkAsReadResponse {
    unreadCount: number; // The API returns the new count, which will be 0
}

export const markNotificationsAsRead = createAsyncThunk<
    MarkAsReadResponse,
    MarkAsReadArgs,
    { rejectValue: string }
>(
    'notifications/markAsRead',
    async (args, { rejectWithValue }) => {
        try {
            // 2. The 'api' service, which handles authentication automatically.
            const response = await api('/notifications/mark-as-read', {
                method: 'PUT',
                // The body is only included if specific IDs are provided
                body: args.notificationIds ? JSON.stringify({ notification_ids: args.notificationIds }) : undefined,
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to mark notifications as read.');
            }
            
            return await response.json() as MarkAsReadResponse;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);