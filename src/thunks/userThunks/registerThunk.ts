import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../appConfig";

export interface RegisterSuccessResponse {
    message: string;
}
export interface RegisterCredentials{
    displayName: string;
    username: string;
    email: string;
    password: string;
    dateOfBirth: string;
    country: string;
}

//---------------------
// Registers the user
//---------------------
export const registerUser = createAsyncThunk<RegisterSuccessResponse, RegisterCredentials, {rejectValue: string }>('register/registerUser', 
    async ({ displayName, username, email, password, dateOfBirth, country}, { rejectWithValue }) => {
        try{
            //-----Sends a register request to the server-----
        
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ displayName, username, password, email, dateOfBirth, country })
            })
            
            //-----Checks if the request failed-----
            if (!response.ok) {
                const data = await response.json()
                return rejectWithValue(data.message || 'Registration Failure')
            }
            //-----Returns success text-----
            const data = await response.json()
            return data

        } catch (error: any) {
            return rejectWithValue(error.message || 'Network Error')
        }
    }
)