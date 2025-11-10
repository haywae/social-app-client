import { createAsyncThunk } from "@reduxjs/toolkit";
import type { UserData } from "../../types/userType";
import type { AppDispatch } from "../../store";
import { scheduleProactiveRefresh } from "../../utils/authUtils";
import { type RefreshReject } from "./refreshTokenThunk";
import api from "../../apiInterceptor";
import { DEVELOPER_MODE } from "../../appConfig";
import { fetchNotifications } from "../notificationThunks/notificationListThunk";
import { fetchSettings } from "../settingsThunks/fetchSettingsThunk";

// Shape of the expected response from the API
interface AuthCheckResponse {
    user: UserData;
    access_token_exp: string;
    csrf_access_token: string;
}

const localTime = new Date().toLocaleTimeString()
//----------------------
// Authenticates the user
//---------------------
export const checkAuth = createAsyncThunk<
    AuthCheckResponse,
    void,
    {
        dispatch: AppDispatch,
        rejectValue: RefreshReject
    }
>(
    'auth/checkAuth',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            // 1. Make the request using the api service.
            // The interceptor will automatically handle 401s and token refreshing.
            DEVELOPER_MODE && console.log('@AUTH_THUNK: Calling the interceptor for an auth-check.', localTime)
            const response = await api('/auth-check', {
                method: 'GET'
            });

            // 2. Check for non-401 errors.
            if (!response.ok) {
                // Try to parse error, but don't fail if body is empty
                const data = await response.json().catch(() => ({}));

                // Treat 500s or other errors as network/server problems.
                // DO NOT log the user out.
                DEVELOPER_MODE && console.log('@AUTH_THUNK: Received an error. Treating it as network error: ', data, localTime)
                return rejectWithValue({
                    type: 'network',
                    message: data.error || `Server error (Status: ${response.status})`
                });
            }


            // 3. Process the successful response.
            const data: AuthCheckResponse = await response.json();

            // Schedule the next proactive refresh.
            if (data.access_token_exp) {
                DEVELOPER_MODE && console.log('@AUTH_THUNK: An access token expiry value was returened.\nNow calling @SCHEDULE_PROACTIVE_TOKEN', localTime)
                scheduleProactiveRefresh(dispatch, data.access_token_exp);
            }

            dispatch(fetchNotifications({ page: 1 }));
            dispatch(fetchSettings());
            
            DEVELOPER_MODE && console.log('@AUTH_THUNK: Authentication successful', data, localTime)
            return data;

        } catch (error: any) {
            // This catch block will receive errors from failed token refreshes
            // or other network issues handled by the interceptor.
            DEVELOPER_MODE && console.log('@AUTH_THUNK: Just received an error. This is the Error object:', error, localTime);
            if (error.type === 'auth') {
                return rejectWithValue({
                    type: 'auth',
                    message: error.message
                });
            }
            return rejectWithValue({
                type: 'network',
                message: error.message || 'An unexpected error occurred.'
            });
        }
    }
);