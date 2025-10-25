import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../appConfig";
import type { UserData } from "../../types/userType";
import { scheduleProactiveRefresh, setLocalStorage } from "../../utils/authUtils";
import type { AppDispatch, RootState } from "../../store";

// Arguments for the thunk
export interface LoginCredentials {
    loginIdentifier: string;
    password: string;
}

// Shape of the successful API response.
// This matches the AuthPayload in the authSlice.
export interface LoginResponse {
    user: UserData;
    csrf_access_token: string;
    csrf_refresh_token: string;
    access_token_exp: string;
}

//---------------------
// Logs in the user
//---------------------
export const loginUser = createAsyncThunk<
    LoginResponse, // 
    LoginCredentials,
    {
        dispatch: AppDispatch,
        state: RootState,
        rejectValue: string
    }
> (
    'auth/loginUser',
    async ({ loginIdentifier, password }, { dispatch, rejectWithValue }) => {
        try { //-----Sends a login request to the server-----
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ loginIdentifier, password }),
            });

            //-----Checks if the request failed-----
            if (!response.ok) {
                const data = await response.json();
                return rejectWithValue(data.message || `Failed to log in (Status: ${response.status})`);
            }

            //-----Return the full auth payload from the API-----
            const data: LoginResponse = await response.json();

            // Immediately schedule the token refresh
            if (data.access_token_exp) {
                scheduleProactiveRefresh(dispatch, data.access_token_exp);
            }
            
            // Persist tokens to localStorage
            setLocalStorage(
                data.access_token_exp,
                data.csrf_access_token,
                data.csrf_refresh_token
            );
            return data;

        } catch (error: any){
            return rejectWithValue(error.message || 'Network Error')
        }
    }
)
