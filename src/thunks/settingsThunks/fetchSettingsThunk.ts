import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import {type UserSettings } from "../../types/settingsType";

export const fetchSettings = createAsyncThunk<
    UserSettings,
    void,
    { rejectValue: string }
>(
    'settings/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api('/settings', {
                method: 'GET',
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to fetch settings.');
            }
            return await response.json();
        } catch (error: any) {
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);
