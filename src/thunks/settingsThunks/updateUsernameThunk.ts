import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import type { UserData } from "../../types/userType";

interface UpdateUsernameArgs {
    new_username: string;
    password: string;
}

// On success, the API returns the updated user object
interface UpdateUsernameResponse {
    message: string;
    user: UserData; 
}

export const updateUsername = createAsyncThunk<
    UserData,
    UpdateUsernameArgs,
    { rejectValue: string }
>(
    'account/updateUsername',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api('/settings/username', {
                method: 'PUT',
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to update username.');
            }
            
            const data: UpdateUsernameResponse = await response.json();
            return data.user;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);