import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";

/**
 * An async thunk for deleting a post.
 * It sends a DELETE request to the backend and returns the ID of the deleted post on success.
 */
export const deletePost = createAsyncThunk<
    string, // On success, we return the ID of the post that was deleted
    string, // The argument is the post ID (a string)
    { rejectValue: string }
>(
    'posts/deletePost',
    async (postId, { rejectWithValue }) => {
        try {
            const response = await api(`/posts/${postId}`, {
                method: 'DELETE',
            });

            // The interceptor will handle 401s; this checks for other errors.
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to delete post.');
            }

            // On success, return the original postId so the slice can remove it.
            return postId;

        } catch (error: any) {
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);
