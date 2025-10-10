import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import { type NotificationData } from "../../slices/notification/notificationSlice";

export interface PaginatedNotificationsResponse {
    notifications: NotificationData[];
    unreadCount: number;
    currentPage: number;
    totalPages: number;
}

interface FetchNotificationsArgs {
    page: number;
}


/** * Fetches Notifications from the API
 * @param page The page number the user wants. Each Page consists of 20 items
 */
export const fetchNotifications = createAsyncThunk<
    PaginatedNotificationsResponse,
    FetchNotificationsArgs,
    { rejectValue: string }
>(
    'notifications/fetchNotifications',
    async ({ page }, { rejectWithValue }) => {
        try {
            const response = await api(`/notifications?page=${page}&per_page=20`, {
                method: 'GET',
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to fetch notifications.');
            }

            const data: PaginatedNotificationsResponse = await response.json();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);