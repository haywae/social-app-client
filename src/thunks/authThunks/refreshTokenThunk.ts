import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../appConfig";
import type { AppDispatch } from "../../store";
import { scheduleProactiveRefresh, setLocalStorage } from "../../utils/authUtils";

export interface RefreshTokenSuccess {
    message: string;
    access_token_exp: string;
    csrf_access_token: string;
    csrf_refresh_token: string;
}
//-------------------------------
// Refreshes the access token
// To avoid infinite loops, it cannot use the interceptor
//-------------------------------
export const refreshToken = createAsyncThunk<RefreshTokenSuccess, void, { dispatch: AppDispatch, rejectValue: string }>('auth/refreshToken',
    async (_, { dispatch, rejectWithValue }) => {
        const csrfRefreshToken = localStorage.getItem('csrfRefreshToken');

        if (!csrfRefreshToken) {
            return rejectWithValue('Refresh token is missing. Please log in again.');
        }

        try {
            // 1. ----- Sends a refresh token request to the server -----
            const response = await fetch(`${API_BASE_URL}/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfRefreshToken
                },
                credentials: 'include'
            });

            // 2. ----- Checks if the request failed -----
            if (!response.ok) {
                const data = await response.json();
                // Consistently return a string message on failure
                return rejectWithValue(data.error || `Failed to refresh token (Status: ${response.status})`);
            }

            // 3. ----- Processes the successful response -----
            const data: RefreshTokenSuccess = await response.json();

            // 4. ----- Update localStorage with the new access token -----
            setLocalStorage(
                data.access_token_exp,
                data.csrf_access_token,
                data.csrf_refresh_token
            );

            localStorage.setItem('auth-sync', JSON.stringify({
                csrfAccessToken: data.csrf_access_token,
                csrfRefreshToken: data.csrf_refresh_token,
                accessTokenExp: data.access_token_exp,
            }));

            // 5. ----- After a successful refresh, schedule the next one using the new expiration time. -----
            if (data.access_token_exp) {
                scheduleProactiveRefresh(dispatch, data.access_token_exp);
            }
            return data;

        } catch (error: any) {
            // Handle network errors and other unexpected issues
            return rejectWithValue(error.error || 'An unexpected network error occurred.');
        }
    }
);