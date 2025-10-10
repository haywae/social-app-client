import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import type { ExchangeData} from "../../types/exchange";

interface ApiResponse {
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
 * An async thunk for fetching the authenticated user's own exchange rate settings.
 */
export const fetchExchangeData = createAsyncThunk<
    ExchangeData,
    void,
    { rejectValue: string }
>(
    'exchange/fetchData',
    async (_, { rejectWithValue }) => {
        try {
            // 2. Use the 'api' service, which handles authentication automatically.
            const response = await api('/settings/exchange', {
                method: 'GET',
            });

            if (response.status === 404) {
                return rejectWithValue('You have not set up your exchange rates yet.');
            }
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to fetch your exchange rates.');
            }
            const data: ApiResponse = await response.json();

            // 3. The transformation logic remains the same.
            const transformedData: ExchangeData = {
                username: '',
                avatarUrl: '',
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