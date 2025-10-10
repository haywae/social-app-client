import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";

interface ToggleLikeArgs {
    postId: string;
    isLiked: boolean;
}

// The thunk will return the data needed for the reducer to confirm the state
interface ToggleLikeResponse {
    postId: string;
    isLiked: boolean;
}

export const toggleLike = createAsyncThunk<
    ToggleLikeResponse,
    ToggleLikeArgs,
    { rejectValue: string }
>(
    'posts/toggleLike',
    async ({ postId, isLiked }, { rejectWithValue }) => {
        const method = isLiked ? 'DELETE' : 'POST';

        try {
            const response = await api(`/posts/${postId}/like`, {
                method: method,
            });

            // response.ok is true for all success statuses (200-299), including 204.
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to update like status.');
            }
            
            // On success, return the new state.
            return { postId, isLiked: !isLiked };

        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);