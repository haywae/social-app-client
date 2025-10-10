import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import { type PaginatedCommentsResponse } from "../../types/commentType";


interface FetchCommentsArgs {
    postId: string;
    page: number;
    focusedCommentId?: string | null;
}

export const fetchComments = createAsyncThunk<
    PaginatedCommentsResponse,
    FetchCommentsArgs,
    { rejectValue: string }
>(
    'comments/fetchComments',
    async ({ postId, page, focusedCommentId }, { rejectWithValue }) => {

        try {
            let apiUrl = `/posts/${postId}/comments?page=${page}&per_page=20`;

            if (focusedCommentId) {
                apiUrl += `&focused_comment_id=${focusedCommentId}`;
            }

            const response = await api(apiUrl, {
                method: 'GET',
            });
            
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