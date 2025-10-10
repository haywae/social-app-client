import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../appConfig';
import { clearLocalStorage } from '../../utils/authUtils';

//---------------------------------------------------------
// Logs a User out
// To avoid infinite loops, it cannot use the interceptor
// --------------------------------------------------------
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, {rejectWithValue}) => {
        const csrfAccessToken = localStorage.getItem('csrfAccessToken');
        if (!csrfAccessToken) {
            return rejectWithValue('Refresh token is missing. Please log in again.');
        }
        try {
            await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfAccessToken
                },
                credentials: 'include',
            });
            // The goal is simply to log the user out on the client.
        } catch (error) {
            // Ignore network errors, the goal is to clear the client state
        } finally{
            clearLocalStorage()
        }
        return;
    }
);