import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import type { PostData } from "../../types/postType";

// Define the arguments for this thunk
interface CreatePostArgs {
    content: string;
    tags?: string[];
    postType?: 'REGULAR' | 'RATE_POST';
}

/**
 * An async thunk for creating a new post.
 * It sends the post content to the backend and returns the newly created post.
 */
export const createPost = createAsyncThunk<
    PostData,
    CreatePostArgs,
    { rejectValue: string }
>(
    'posts/createPost',
    async ({ content, tags, postType }, { rejectWithValue }) => {
        try {
            const response = await api('/create-post', {
                method: 'POST',
                body: JSON.stringify({ content, tags, postType: postType}),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to create post.');
            }

            const newPost: PostData = await response.json();
            return newPost;

        } catch (error: any) {
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);