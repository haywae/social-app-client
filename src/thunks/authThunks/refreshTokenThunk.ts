import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL, DEVELOPER_MODE } from "../../appConfig";
import type { AppDispatch } from "../../store";
import { scheduleProactiveRefresh, setLocalStorage } from "../../utils/authUtils";

export interface RefreshTokenSuccess {
    message: string;
    access_token_exp: string;
    csrf_access_token: string;
    csrf_refresh_token: string;
}

export interface RefreshReject {
    type: 'auth' | 'network';
    message: string;
}
//-------------------------------
// Refreshes the access token
// To avoid infinite loops, it cannot use the interceptor
//-------------------------------
export const refreshToken = createAsyncThunk<RefreshTokenSuccess, void, { dispatch: AppDispatch, rejectValue: RefreshReject }>('auth/refreshToken',
    async (_, { dispatch, rejectWithValue }) => {
        const csrfRefreshToken = localStorage.getItem('csrfRefreshToken');

        if (!csrfRefreshToken) {
            return rejectWithValue({
                type: 'auth',
                message: 'Refresh token is missing. Please log in again.'
            });
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
                // This is a "real" auth error. Log the user out.
                if (response.status === 401 || response.status === 403) {
                    return rejectWithValue({
                        type: 'auth',
                        message: data.error || 'Session expired. Please log in again.'
                    });
                }

                return rejectWithValue({
                    type: 'network',
                    message: data.error || `Failed to refresh token (Status: ${response.status})`
                });
            }

            // 3. ----- Processes the successful response -----
            DEVELOPER_MODE && console.log('refreshToken Thunk: Token refresh successful')
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
            DEVELOPER_MODE && console.log('Error from refreshToken Thunk, This is the Error type: ', error.type);

            return rejectWithValue({
                type: 'network',
                message: error.message || 'Network Error'
            });
        }
    }
);