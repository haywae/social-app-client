import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { fetchSettings } from "../../thunks/settingsThunks/fetchSettingsThunk";
import { updateSettings } from "../../thunks/settingsThunks/updateSettingsThunk";

export interface UserSettings {
    username: string;
    display_name: string;
    email: string;
    bio: string;
    profile_picture_url: string;
}

export interface SettingsState {
    settings: UserSettings | null;
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: SettingsState = {
    settings: null,
    loading: 'idle',
    error: null,
};

const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {    
        clearSettingsError: (state) => {
            state.error = null;
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSettings.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(fetchSettings.fulfilled, (state, action: PayloadAction<UserSettings>) => {
                state.loading = 'succeeded';
                state.settings = action.payload;
            })
            .addCase(fetchSettings.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload ?? 'Could not fetch settings.';
            })
            .addCase(updateSettings.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(updateSettings.fulfilled, (state, action: PayloadAction<UserSettings>) => {
                state.loading = 'succeeded';
                // Merge the updated settings from the API response
                if (state.settings) {
                    state.settings = { ...state.settings, ...action.payload };
                } else {
                    state.settings = action.payload;
                }
            })
            .addCase(updateSettings.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload ?? 'Could not update settings.';
            });
    }
});

export const { clearSettingsError } = settingsSlice.actions;
export default settingsSlice.reducer;