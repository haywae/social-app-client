import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import { type UserSettings } from "../../types/settingsType";
import { updateUser } from "../../slices/auth/authSlice";
import { type AppDispatch } from "../../store";

interface UpdateSettingsArgs {
    settingsData: Partial<UserSettings>;
}

export const updateSettings = createAsyncThunk<
    UserSettings,
    UpdateSettingsArgs,
    { dispatch: AppDispatch, rejectValue: string }
>(
    'settings/updateSettings',
    async ({ settingsData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await api('/settings', {
                method: 'PUT',
                body: JSON.stringify(settingsData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to update settings.');
            }
            const data = await response.json();

            dispatch(updateUser(data.settings));

            return data.settings;
        } catch (error: any) {
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);
