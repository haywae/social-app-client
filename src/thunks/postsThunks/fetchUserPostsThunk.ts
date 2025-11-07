import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../appConfig";
import api from "../../apiInterceptor";
import { type RootState } from "../../store";
import { type FetchedPostsPayload, type PostData } from "../../types/postType";

// Define the arguments for this specific thunk
interface FetchUserPostsArgs {
    username: string;
    page: number;
    perPage: number;
}

/**
 * An async thunk for fetching a paginated list of posts for a specific user.
 */
export const fetchUserPosts = createAsyncThunk<
    FetchedPostsPayload,
    FetchUserPostsArgs,
    { state: RootState, rejectValue: string } // Add state to the config
>(
    'posts/fetchUserPosts',
    async ({ username, page, perPage }, { getState, rejectWithValue }) => {
        // Check authentication status from the Redux store
        const { isAuthenticated } = getState().auth;
        const url = `/users/${username}/posts?page=${page}&per_page=${perPage}`;

        try {
            let response: Response;

            if (isAuthenticated) {
                // If logged in, use the 'api' service for automatic token handling
                response = await api(url, {
                    method: 'GET',
                });
            } else {
                // If logged out, use a standard anonymous fetch
                response = await fetch(`${API_BASE_URL}${url}`, {
                    method: 'GET',
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to fetch user posts');
            }

            // 3. Process the data just like you do in fetchPosts
            const data = await response.json();
            const postsFromApi: PostData[] = data.posts;

            // 4. Return the correct, normalized payload
            return {
                posts: postsFromApi,
                currentPage: data.currentPage,
                totalPages: data.totalPages,
            };
        } catch (error: any) {
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);