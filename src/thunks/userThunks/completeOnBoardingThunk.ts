import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import type { UserData } from "../../types/userType";
import { allCountries } from "../../assets/countries";

// Interface for the data sent to the API
export interface OnboardingData {
    dateOfBirth: string;
    country: string;
    baseCurrency?: string;
}

// Interface for the expected successful API response
export interface OnboardingResponse {
    message: string;
    user: UserData;
}

//-----------------------------------------------------
// Completes the user's profile after a social sign-in
//-----------------------------------------------------
export const completeOnboardingThunk = createAsyncThunk<
    OnboardingResponse,       // Type for the fulfilled return value
    OnboardingData,           // Type for the thunk argument
    {
        rejectValue: string  // Type for the rejected value
    }
>('auth/completeOnboarding',
    async (onboardingData, { rejectWithValue }) => {
        try {
            const selectedCountry = allCountries.find(c => c.name === onboardingData.country);
            if (!selectedCountry || !selectedCountry.currencyCode) {
                return rejectWithValue('Could not determine a currency for the selected country.');
            }
            const baseCurrency = selectedCountry.currencyCode;
            onboardingData = { ...onboardingData, baseCurrency };
            //-----Sends an onboarding completion request to the server-----
            const response = await api('/onboarding/complete', {
                method: 'POST',
                body: JSON.stringify(onboardingData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to complete profile.');
            }

            const data: OnboardingResponse = await response.json();
            return data;

        } catch (error: any) {
            // The interceptor might throw an error on network failure or during token refresh failure
            const message = error.message || 'An unexpected network error occurred.';
            return rejectWithValue(message);
        }
    }
);

