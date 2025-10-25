import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import { type UserSettings } from "../../types/settingsType";

interface UpdateSettingsArgs {
    settingsData: Partial<UserSettings>;
}

export const updateSettings = createAsyncThunk<
    UserSettings,
    UpdateSettingsArgs,
    { rejectValue: string }
>(
    'settings/updateSettings',
    async ({ settingsData }, { rejectWithValue }) => {
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
            return data.settings; // The backend returns the updated settings under a 'settings' key
        } catch (error: any) {
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);
