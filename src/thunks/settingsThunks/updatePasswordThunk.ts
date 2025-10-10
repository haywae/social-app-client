import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";

interface UpdatePasswordArgs {
    old_password: string;
    new_password: string;
}

export const updatePassword = createAsyncThunk<
    { message: string }, // API returns a success message
    UpdatePasswordArgs,
    { rejectValue: string }
>(
    'account/updatePassword',
    async (passwords, { rejectWithValue }) => {
        try {
            const response = await api('/settings/password', {
                method: 'PUT',
                body: JSON.stringify(passwords),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to update password.');
            }
            return await response.json();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
