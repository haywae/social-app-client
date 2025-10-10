import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import type { PostData as Post } from "../../types/postType";

interface UpdatePostArgs {
    postId: string;
    content: string;
    tags?: string[];
}

/**
 * An async thunk for updating a post.
 * It sends the updated content to the backend and returns the full updated post object.
 */
export const updatePost = createAsyncThunk<
    Post,
    UpdatePostArgs,
    { rejectValue: string }
>(
    'posts/updatePost',
    async ({ postId, content, tags }, { rejectWithValue }) => {
        try {
            // 2. Use the 'api' service, which handles authentication automatically.
            const response = await api(`/posts/${postId}`, {
                method: 'PUT',
                body: JSON.stringify({ content, tags }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to update post.');
            }

            const updatedPost: Post = await response.json();
            return updatedPost;

        } catch (error: any) {
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);
