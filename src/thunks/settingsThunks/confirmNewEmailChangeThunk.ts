import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../appConfig";

// This thunk calls the second endpoint to finalize the change
export const confirmEmailChange = createAsyncThunk<
    { message: string }, // Returns success object on fulfillment
    string, // Takes the token as input
    { rejectValue: string }
>(
    'user/confirmEmailChange',
    async (token, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/settings/email/confirm-change`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            const data = await response.json();
            if (!response.ok) {
                return rejectWithValue(data.message || 'Email change confirmation failed.');
            }
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);