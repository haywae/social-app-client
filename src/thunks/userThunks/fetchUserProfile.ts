import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import type { RootState } from "../../store";
import { API_BASE_URL } from "../../appConfig";
import { type UserProfileData } from "../../types/userProfileType";

/**
 * An async thunk for fetching the profile data for a specific user.
 */
export const fetchUserProfile = createAsyncThunk<
    UserProfileData,
    string,
    { state: RootState, rejectValue: string } // Added RootState for getState
>(
    'profile/fetchUserProfile',
    async (username, { getState, rejectWithValue }) => {
        // Use the Redux state as the source of truth for authentication
        const { isAuthenticated } = getState().auth;

        try {
            let response: Response;

            if (isAuthenticated) {
                // If the user is logged in, use the 'api' service for an authenticated request.
                // This handles tokens and credentials automatically.
                response = await api(`/users/${username}`, {
                    method: 'GET',
                });
            } else {
                // If the user is logged out, use a standard anonymous fetch.
                response = await fetch(`${API_BASE_URL}/users/${username}`, {
                    method: 'GET',
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 404) {
                    return rejectWithValue('User not found.');
                }
                return rejectWithValue(errorData.message || 'Failed to fetch user profile.');
            }

            return await response.json();

        } catch (error: any) {
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);