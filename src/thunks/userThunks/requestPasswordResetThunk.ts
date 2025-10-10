import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../appConfig";

interface PasswordRequestResetApiResponse {
    message: string;
}

export const requestPasswordReset = createAsyncThunk< PasswordRequestResetApiResponse, string, { rejectValue: string }>('passwordReset/requestPasswordReset',
    async (email, { rejectWithValue }) => {
        try { //-----Sends request to the server-----
            const response = await fetch(`${API_BASE_URL}/request-password-reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email })
            });

            //-----Checks if the request failed-----
            if (!response.ok) {
                const data = await response.json();
                return rejectWithValue(data.message || 'Failed to request password reset');
            }

            //-----Returns success message-----
            const data: PasswordRequestResetApiResponse = await response.json();
            return data;

        } catch (error: any) {
            // Catches network errors or other issues with the fetch request
            return rejectWithValue(error.message || 'Network Error');
        }
    }
);
