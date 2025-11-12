import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL, DEVELOPER_MODE } from "../../appConfig";
import type { AppDispatch, RootState } from "../../store";
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
const localTime = () => new Date().toLocaleTimeString()
const REFRESH_TIMEOUT_MS = 9000; // 9 seconds
//-------------------------------
// Refreshes the access token
// To avoid infinite loops, it cannot use the interceptor
//-------------------------------
export const refreshToken = createAsyncThunk<RefreshTokenSuccess, void, { dispatch: AppDispatch, state: RootState, rejectValue: RefreshReject }>('auth/refreshToken',
    async (_, { dispatch, rejectWithValue }) => {
        const csrfRefreshToken = localStorage.getItem('csrfRefreshToken');

        if (!csrfRefreshToken) {
            DEVELOPER_MODE && console.log(localTime(), '- @REFRESH_THUNK: csrfRefreshToken was not retrieved from local storage')
            return rejectWithValue({
                type: 'auth',
                message: 'Refresh token is missing. Please log in again.'
            });
        }

        const controller = new AbortController();
        const signal = controller.signal

        const timeoutId = setTimeout(() => {
            DEVELOPER_MODE && console.log(localTime(), '- @REFRESH_THUNK: Request timed out after 9s. Aborting.');
            controller.abort();
        }, REFRESH_TIMEOUT_MS);

        try {
            // 1. ----- Sends a refresh token request to the server -----
            DEVELOPER_MODE && console.log(
               localTime(), `- @REFRESH_THUNK: This is the CSRF  REFRESH THUNK Retrieved from local storage: ${csrfRefreshToken} \nAttempting a refresh with it}`
            )

            const response = await fetch(`${API_BASE_URL}/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfRefreshToken
                },
                credentials: 'include', 
                signal: signal
            });

            clearTimeout(timeoutId);

            // 2. ----- Checks if the request failed -----
            if (!response.ok) {
                const data = await response.json();
                // This is a "real" auth error. Log the user out.
                if (response.status === 401 || response.status === 403) {
                    DEVELOPER_MODE && console.log(localTime(),'- @REFRESH_THUNK: 401 or 403 error from the refresh thunk. Error object: ', data)
                    return rejectWithValue({
                        type: 'auth',
                        message: data.error || 'Session expired. Please log in again.'
                    });
                }
                DEVELOPER_MODE && console.log(localTime(),'- @REFRESH_THUNK: Received an error likely a network problem. Error object: ', data)
                // This is a server error (5xx) or other issue. Treat it as a network problem.
                return rejectWithValue({
                    type: 'network',
                    message: data.error || `Failed to refresh token (Status: ${response.status})`
                });
            }

            // 3. ----- Processes the successful response -----
            DEVELOPER_MODE && console.log(localTime(), '- @REFRESH_THUNK: Token refresh successful')
            const data: RefreshTokenSuccess = await response.json();

            // 4. ----- Update localStorage with the new access token -----
            setLocalStorage(
                data.access_token_exp,
                data.csrf_access_token,
                data.csrf_refresh_token
            );
            DEVELOPER_MODE && console.log(localTime(), `- @REFRESH_THUNK: Setting these tokens in local storage`, data)

            // 5. ----- After a successful refresh, schedule the next one using the new expiration time. -----
            if (data.access_token_exp) {
                scheduleProactiveRefresh(dispatch, data.access_token_exp);
            }
            return data;

        } catch (error: any) {
            clearTimeout(timeoutId);

            // Handle network errors and other unexpected issues
            DEVELOPER_MODE && console.log(localTime(), '- @REFRESH_THUNK: Just caught an error.\nThis is the Error object: ', error);

            return rejectWithValue({
                type: error.type || 'network',
                message: error.message || 'Network Error'
            });
        }
    }
);