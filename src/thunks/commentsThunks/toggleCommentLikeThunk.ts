import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";

interface ToggleLikeArgs {
    commentId: string;
    isLiked: boolean;
}
// The thunk Returns the new like status/count from the server if available
interface ToggleLikeResponse {
    likeCount: number;
    isLiked: boolean;
}


export const toggleCommentLike = createAsyncThunk<
    ToggleLikeResponse, // It's good practice for the API to return the new state
    ToggleLikeArgs,
    { rejectValue: string }
>(
    'comments/toggleLike',
    async ({ commentId, isLiked }, { rejectWithValue }) => {
        const method = isLiked ? 'DELETE' : 'POST';
        const endpoint = `/comments/${commentId}/like`;

        try {
            // Use the 'api' service, which handles authentication automatically
            const response = await api(endpoint, {
                method: method,
            });

            // response.ok is true for statuses 200-299 (including 204 for DELETE)
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to update like status.');
            }

            // If the API returns the new like count and status.
            // If the response is 204 No Content (from DELETE), the body will be empty.
            if (response.status === 204) {
                // We can infer the new state on the client if needed
                return { isLiked: false, likeCount: 0 }; 
            }
            
            const data: ToggleLikeResponse = await response.json();
            return data;

        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);