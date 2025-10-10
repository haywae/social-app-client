import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../appConfig";

interface ResetPasswordSuccess {
    message: string;
}

// Define clear types for the operation
export interface ResetPasswordCredentials {
    token: string;
    newPassword: string;
}

//----------------------------------------------------
// Submits the new password with the reset token
//----------------------------------------------------
export const resetPassword = createAsyncThunk< ResetPasswordSuccess, ResetPasswordCredentials, { rejectValue: string }>( 'passwordReset/resetPassword', 
    async ({ token, newPassword }, { rejectWithValue }) => {
        try { //-----Sends the new password and token to the server-----
            const response = await fetch(`${API_BASE_URL}/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ newPassword }),
            });
    
            //------Checks if the request failed-----
            if (!response.ok) {
                console.error(`Password reset failed: ${response.status} - ${response.statusText}`);
                const data = await response.json();
                return rejectWithValue(data.message || 'Failed to reset password');
            }

            //------Returns success message-----
            const data: ResetPasswordSuccess = await response.json();
            return data;
            
        } catch (error: any) {
            // Catches network errors or other issues
            return rejectWithValue(error.message || 'Network Error');
        }
    }
);