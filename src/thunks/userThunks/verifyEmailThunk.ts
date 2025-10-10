import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../appConfig";

// This thunk will take the token string as its argument
export const verifyEmail = createAsyncThunk<
    string, // On success, it will return the success message string
    string, // The token
    { rejectValue: string }
>(
    'user/verifyEmail',
    async (token, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token })
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Verification failed.');
            }
            
            return data.message; // e.g., "Your email has been successfully verified."

        } catch (error: any) {
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);