import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";

// This type is based on the 'serialize_user_for_list' helper
export interface UserForList {
    username: string;
    authorName: string;
    authorAvatarUrl: string | null;
    bio: string | null;
    isFollowing: boolean;
    isSelf: boolean;
}

interface FetchConnectionsArgs {
    username: string;
    listType: 'followers' | 'following';
    page: number;
    perPage: number;
}

interface FetchedConnectionsPayload {
    users: UserForList[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
}

export const fetchConnections = createAsyncThunk<
    FetchedConnectionsPayload,
    FetchConnectionsArgs,
    { rejectValue: string }
>(
    'connections/fetchConnections',
    async ({ username, listType, page, perPage }, { rejectWithValue }) => {
        try {
            const response = await api(
                `/profile/${username}/${listType}?page=${page}&per_page=${perPage}`, 
                { method: 'GET' }
            );

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to fetch connections.');
            }

            const data = await response.json();

            return {
                users: data.users,
                currentPage: data.currentPage,
                totalPages: data.totalPages,
                totalItems: data.totalItems
            };
            
        } catch (error: any) {
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);