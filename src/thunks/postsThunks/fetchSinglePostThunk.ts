import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../appConfig";
import type { PostData } from "../../types/postType";
import api from "../../apiInterceptor";
import type { RootState } from "../../store";

/**
 * An async thunk for fetching a single post by its ID.
 * This is optionally authenticated to allow anyone to view a post.
 */

export const fetchSinglePost = createAsyncThunk<
    PostData,
    string, // The argument is the post ID
    { state: RootState, rejectValue: string } // Add state to the config
>(
    'posts/fetchSinglePost',
    async (postId, { getState, rejectWithValue }) => {
        // Check the authentication status from the Redux store
        const { isAuthenticated } = getState().auth;

        try {
            let response: Response;

            if (isAuthenticated) {
                // If the user is logged in, use the 'api' service for automatic token handling
                response = await api(`/posts/${postId}`, {
                    method: 'GET',
                });
            } else {
                // If the user is logged out, use a standard anonymous fetch
                response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                    method: 'GET',
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to fetch post.');
            }

            const post: PostData = await response.json();
            return post;

        } catch (error: any) {
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);