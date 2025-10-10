import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";

// The thunk takes the user's password for verification
interface DeleteAccountArgs {
    password: string;
}

// The API returns a simple success message
interface DeleteAccountResponse {
    message: string;
}

/**
 * An async thunk to permanently delete the authenticated user's account.
 */
export const deleteAccount = createAsyncThunk<
    DeleteAccountResponse,
    DeleteAccountArgs,
    { rejectValue: string }
>(
    'account/deleteAccount',
    async ({ password }, { rejectWithValue }) => {
        try {
            const response = await api('/settings', {
                method: 'DELETE',
                body: JSON.stringify({ password }),
            });

            if (!response.ok) {
                // The API returns an error message for incorrect password or other issues
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to delete account.');
            }
            
            // On success, return the response from the server
            return await response.json();

        } catch (error: any) {
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);