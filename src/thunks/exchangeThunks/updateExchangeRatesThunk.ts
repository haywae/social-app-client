import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import type { ExchangeData, Rate } from "../../types/exchange";
import { transformRatesForApi } from "../../utils/exchangeUtils";


// Type for the argument passed to the thunk
interface UpdateRatesPayload {
    rates: Rate[];
}

// The API returns a message and the updated exchange object
interface UpdateResponse {
    message: string;
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
    }
}

/**
 * An async thunk for updating any part of the authenticated user's exchange rate settings.
 * This single thunk handles updating details (name, country) and/or the rates array.
 */
export const updateExchangeRates = createAsyncThunk<
    ExchangeData,
    UpdateRatesPayload,
    { rejectValue: string }
>(
    'exchange/updateSettings',
    async (updateData, { rejectWithValue }) => {
        try {
            // 1. Use the 'api' service, which handles authentication automatically.
            const response = await api('/settings/exchange', {
                method: 'PUT',
                body: JSON.stringify(transformRatesForApi(updateData)),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to update exchange settings.');
            }

            const responseData: UpdateResponse = await response.json();
            const updatedExchange = responseData.exchange;

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