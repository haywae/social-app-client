import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import { API_BASE_URL } from "../../appConfig";
import type { RootState } from "../../store";
import type { ExchangeData } from "../../types/exchange";

// Define the shape of the raw API response
interface ApiResponse {
    username: string;
    avatarUrl: string;
    name: string;
    country: string;
    base_currency: string;
    last_updated: string;
    rates: {
        currency_code: string,
        buy_rate: number,
        sell_rate: number
    }[];
}

/**
 * An async thunk for fetching a specific user's public exchange data.
 */
export const fetchUserExchangeData = createAsyncThunk<
    ExchangeData,
    string, // The username is the input
    { state: RootState, rejectValue: string } // Add state to the config
>(
    'profile/fetchUserExchangeData',
    async (username, { getState, rejectWithValue }) => {
        // Check the authentication status from the Redux store
        const { isAuthenticated } = getState().auth;

        try {
            let response: Response;

            if (isAuthenticated) {
                // If the user is logged in, use the 'api' service for automatic token handling
                response = await api(`/users/${username}/exchange`, {
                    method: 'GET',
                });
            } else {
                // If the user is logged out, use a standard anonymous fetch
                response = await fetch(`${API_BASE_URL}/users/${username}/exchange`, {
                    method: 'GET',
                });
            }

            if (!response.ok) {
                if (response.status === 404) {
                    return rejectWithValue('This user has not published their exchange rates.');
                }
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to fetch exchange rates.');
            }

            const data: ApiResponse = await response.json();

            // Transform the API response (this logic remains the same)
            const transformedData: ExchangeData = {
                username: data.username,
                avatarUrl: data.avatarUrl,
                name: data.name,
                country: data.country,
                base_currency: data.base_currency,
                last_updated: data.last_updated,
                rates: data.rates.map((rate) => ({
                    currency: rate.currency_code,
                    buy: rate.buy_rate,
                    sell: rate.sell_rate,
                })),
            };
            return transformedData;

        } catch (error: any) {
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);