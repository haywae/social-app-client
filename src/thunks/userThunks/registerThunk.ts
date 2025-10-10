import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../appConfig";
import type { UserData } from "../../types/user";
import { allCountries } from "../../assets/countries";


export interface RegisterCredentials{
    displayName: string;
    username: string;
    email: string;
    password: string;
    date_of_birth: string;
    country: string;
}

//---------------------
// Registers the user
//---------------------
export const registerUser = createAsyncThunk<UserData, RegisterCredentials, {rejectValue: string }>('register/registerUser', 
    async ({ displayName, username, email, password, date_of_birth, country}, { rejectWithValue }) => {
        try{
            //-----Sends a register request to the server-----
            // --- Determine the base currency from the selected country ---
            const selectedCountry = allCountries.find(c => c.name === country);
            if (!selectedCountry || !selectedCountry.currencyCode) {
                return rejectWithValue('Could not determine a currency for the selected country.');
            }
            const baseCurrency = selectedCountry.currencyCode;
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ displayName, username, password, email, date_of_birth, country, baseCurrency})
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