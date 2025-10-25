import { createAsyncThunk } from "@reduxjs/toolkit";
import type { UserData } from "../../types/userType";
import type { AppDispatch } from "../../store";
import { scheduleProactiveRefresh } from "../../utils/authUtils";
import api from "../../apiInterceptor";

// Shape of the expected response from the API
interface AuthCheckResponse {
    user: UserData;
    csrf_access_token: string;
    csrf_refresh_token: string;
    access_token_exp: string;
}
//----------------------
// Authenticates the user
//---------------------
export const checkAuth = createAsyncThunk<
    AuthCheckResponse,
    void,
    {
        dispatch: AppDispatch,
        rejectValue: string
    }
>(
    'auth/checkAuth',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            // 1. Make the request using the api service.
            // The interceptor will automatically handle 401s and token refreshing.
            const response = await api('/auth-check', {
                method: 'GET'
            });

            // 2. Check for non-401 errors.
            if (!response.ok) {
                const data = await response.json();
                return rejectWithValue(data.error || 'Authentication check failed.');
            }

            // 3. Process the successful response.
            const data: AuthCheckResponse = await response.json();

            // Schedule the next proactive refresh.
            if (data.access_token_exp) {
                scheduleProactiveRefresh(dispatch, data.access_token_exp);
            }
            
            return data;

        } catch (error: any) {
            // This catch block will receive errors from failed token refreshes
            // or other network issues handled by the interceptor.
            return rejectWithValue(error.message || 'An unexpected error occurred.');
        }
    }
);