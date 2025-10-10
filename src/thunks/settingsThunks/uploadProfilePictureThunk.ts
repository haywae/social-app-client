import { createAsyncThunk } from "@reduxjs/toolkit";
import imageCompression from 'browser-image-compression'
import api from "../../apiInterceptor";
import { type RootState } from "../../store";

interface UploadApiResponse {
    message: string;
    profile_picture_url: string;
}

export interface UploadPayload {
    username: string;
    profilePictureUrl: string;
}
export const uploadProfilePicture = createAsyncThunk<
    UploadPayload,
    File, // The thunk takes a File object as input
    { state: RootState, rejectValue: string }
>(
    'settings/uploadProfilePicture',
    async (file, { getState, rejectWithValue }) => {
        const csrfToken = localStorage.getItem('csrfAccessToken');
        if (!csrfToken) return rejectWithValue('Authentication token not found.');

            // --- COMPRESSION---
            const options = {
                maxSizeMB: 1,          // Max file size in MB
                maxWidthOrHeight: 1024, // Max width or height in pixels
                useWebWorker: true,    // Web worker for better performance
            }
            const compressedFile = await imageCompression(file, options);

        const formData = new FormData();
        formData.append('profile_picture', compressedFile, file.name); // 'profile_picture' is the field name the backend expects

        try {
            // NOTE: We don't set Content-Type; the browser does it for FormData
            const response = await api(`/settings/profile-picture`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to upload image.');
            }
            const apiData: UploadApiResponse = await response.json();

            const username = getState().auth.user?.username;

            if (!username) {
                return rejectWithValue('Could not find user in state to update picture.');
            }

            const refinedData: UploadPayload = {
                username: username,
                profilePictureUrl: apiData.profile_picture_url
            };

            return refinedData
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);