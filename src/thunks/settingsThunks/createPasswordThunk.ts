import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor"; // Assuming your interceptor is here
import { type CreatePasswordArgs } from "../../types/settingsType";

/**
 * Async thunk to create a password for an OAuth-only user.
 * This calls the new POST /settings/create-password endpoint.
 */
export const createPassword = createAsyncThunk<
    string, // Return type on success (e.g., a success message)
    CreatePasswordArgs,
    { rejectValue: string }
>(
    'settings/createPassword',
    async ({ new_password }, { rejectWithValue }) => {
        try {
            const response = await api('/settings/password/create', {
                method: 'POST',
                body: JSON.stringify({ new_password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Use message from backend response, or a fallback
                return rejectWithValue(data.message || 'Failed to create password.');
            }
            
            // On success, return the success message (e.g., "Password created successfully.")
            return data.message; 
        } catch (error: any) {
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);
