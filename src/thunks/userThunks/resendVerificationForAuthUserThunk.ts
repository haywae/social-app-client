import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
/**
 * Async thunk for an authenticated user to request a new email verification link.
 * It does not require any payload, as the user is identified by their JWT.
 */
export const resendVerificationForAuthUser = createAsyncThunk<
    { message: string },
    void,
    { rejectValue: string }
>(
    'auth/resendVerificationForAuthUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api('/settings/email/resend-verification', {
                method: 'POST',
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'An unexpected error occurred.');
            }
            
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to connect to the server.');
        }
    }
);