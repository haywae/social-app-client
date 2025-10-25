import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../appConfig";
import type { RootState } from "../../store";
import type { CommentData } from "../../types/commentType";
import api from "../../apiInterceptor";
/**
 * An async thunk for fetching a single post by its ID.
 * This is optionally authenticated to allow anyone to view a post.
 */
export const fetchSingleComment = createAsyncThunk<
    CommentData, // Return type
    { commentId: string },
    { state: RootState, rejectValue: string } 
>(
    'comments/fetchSingleComment',
    async ({ commentId }, { getState, rejectWithValue }) => {
        // Check the authentication status from the Redux store
        const { isAuthenticated } = getState().auth;

        try {
            let response: Response;

            if (isAuthenticated) {
                // 1. If the user is logged in, use the 'api' service.
                // This provides automatic token attachment and refreshing.
                response = await api(`/comments/${commentId}`, {
                    method: 'GET',
                });
            } else {
                // 2. If the user is logged out, uses a standard anonymous fetch.
                response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
                    method: 'GET',
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to fetch comment.');
            }

            const comment: CommentData = await response.json();
            return comment;

        } catch (error: any) {
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);