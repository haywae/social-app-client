import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import { type PaginatedCommentsResponse } from "../../types/commentType";
import { API_BASE_URL } from "../../appConfig";
import type { RootState } from "../../store";


interface FetchCommentsArgs {
    postId: string;
    page: number;
    focusedCommentId?: string | null;
}

export const fetchComments = createAsyncThunk<
    PaginatedCommentsResponse,
    FetchCommentsArgs,
    { state: RootState; rejectValue: string }
>(
    'comments/fetchComments',
    async ({ postId, page, focusedCommentId }, { getState, rejectWithValue }) => {

        const { isAuthenticated } = getState().auth; // <-- 5. Check auth state

        try {
            let apiUrl = `/posts/${postId}/comments?page=${page}&per_page=20`;

            if (focusedCommentId) {
                apiUrl += `&focused_comment_id=${focusedCommentId}`;
            }

            let response: Response; // <-- 6. Declare response variable

            if (isAuthenticated) {
                // 7. If logged in, use the secure 'api' interceptor
                response = await api(apiUrl, {
                    method: 'GET',
                });
            } else {
                // 8. If logged out, use a standard anonymous fetch
                response = await fetch(`${API_BASE_URL}${apiUrl}`, {
                    method: 'GET',
                });
            }
            // The interceptor handles 401s, so we only need to check for other errors.
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to fetch comments.');
            }
            
            const data = await response.json();
            return data;

        } catch (error: any) {
            // This will catch errors from the interceptor (e.g., failed refresh) or network issues.
            return rejectWithValue(error.message);
        }
    }
);