import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../appConfig';
import { clearLocalStorage } from '../../utils/authUtils';

//---------------------------------------------------------
// Logs a User out
// To avoid infinite loops, it cannot use the interceptor
// --------------------------------------------------------
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_,) => {
        const csrfAccessToken = localStorage.getItem('csrfAccessToken');
        try {
            if (csrfAccessToken) {
                await fetch(`${API_BASE_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfAccessToken
                    },
                    credentials: 'include',
                });
            }
        } catch (error) {

        } finally {
            clearLocalStorage()
        }
        return;
    }
);