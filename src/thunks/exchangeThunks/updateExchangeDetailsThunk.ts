import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import type { ExchangeData } from "../../types/exchange";


// Type for the argument passed to the thunk
interface UpdateDetailsPayload {
    name: string;
    country: string;
    base_currency: string;
}

// Type for the expected successful API response
interface UpdateDetailsResponse {
    exchange: {
        name: string;
        country: string;
        base_currency: string;
        last_updated: string;
        rates: {
            currency_code: string,
            buy_rate: number,
            sell_rate: number
        }[];
    };
    message: string;
}

/**
 * An async thunk for updating the user's exchange details (name, country, etc.).
 */
export const updateExchangeDetails = createAsyncThunk<
    ExchangeData,
    UpdateDetailsPayload,
    { rejectValue: string }
>(
    'exchange/updateDetails',
    async (details, { rejectWithValue }) => {
        try {
            const response = await api('/settings/exchange', {
                method: 'PUT',
                body: JSON.stringify(details),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to update exchange details.');
            }

            const data: UpdateDetailsResponse = await response.json();
            const updatedExchange = data.exchange;

            // The transformation logic remains the same.
            const transformedData: ExchangeData = {
                username: '',
                avatarUrl: '',
                name: updatedExchange.name,
                country: updatedExchange.country,
                base_currency: updatedExchange.base_currency,
                last_updated: updatedExchange.last_updated,
                rates: updatedExchange.rates.map(rate => ({
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