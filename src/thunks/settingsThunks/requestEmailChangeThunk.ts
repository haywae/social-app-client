import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";

interface RequestEmailChangeArgs {
    new_email: string;
    password: string;
}

export const requestEmailChange = createAsyncThunk<
    { message: string },
    RequestEmailChangeArgs,
    { rejectValue: string }
>(
    'account/requestEmailChange',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api('/settings/email/request-change', {
                method: 'POST',
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to request email change.');
            }
            return await response.json();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);