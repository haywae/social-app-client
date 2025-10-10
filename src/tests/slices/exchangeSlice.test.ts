import { describe, it, expect } from 'vitest';
import exchangeReducer, {
    clearExchangeData,
    type ExchangeState,
    type ExchangeData,
} from '../../slices/exchange/exchangeSlice'; // Adjust path as needed
import { fetchExchangeData } from '../../thunks/exchangeThunks/fetchExchangeDataThunk';
import { updateExchangeRates } from '../../thunks/exchangeThunks/updateExchangeRatesThunk';

describe('exchangeSlice', () => {
    // --- Initial State ---
    const initialState: ExchangeState = {
        exchangeData: null,
        loading: 'idle',
        error: null,
    };

    // --- Mock Data ---
    const mockExchangeData: ExchangeData = {
        name: 'Test Exchange',
        country: 'Testland',
        base_currency: 'TSD',
        rates: [{ currency: 'ABC', buy: 1.1, sell: 1.2 }],
        last_updated: new Date().toISOString(),
    };

    // --- Tests ---
    it('should return the initial state on first run', () => {
        const nextState = exchangeReducer(undefined, { type: 'unknown' });
        expect(nextState).toEqual(initialState);
    });

    describe('synchronous reducers', () => {
        it('should handle clearExchangeData', () => {
            // Create a modified state to test against
            const modifiedState: ExchangeState = {
                exchangeData: mockExchangeData,
                loading: 'succeeded',
                error: 'An old error',
            };
            const nextState = exchangeReducer(modifiedState, clearExchangeData());
            expect(nextState).toEqual(initialState);
        });
    });

    describe('fetchExchangeData extraReducers', () => {
        it('should set loading to pending when fetchExchangeData is pending', () => {
            const action = { type: fetchExchangeData.pending.type };
            const nextState = exchangeReducer(initialState, action);
            expect(nextState.loading).toBe('pending');
            expect(nextState.error).toBeNull();
        });

        it('should set exchangeData when fetchExchangeData is fulfilled', () => {
            const action = { type: fetchExchangeData.fulfilled.type, payload: mockExchangeData };
            const nextState = exchangeReducer(initialState, action);
            expect(nextState.loading).toBe('succeeded');
            expect(nextState.exchangeData).toEqual(mockExchangeData);
        });

        it('should set error when fetchExchangeData is rejected', () => {
            const errorMessage = 'Failed to fetch data';
            const action = { type: fetchExchangeData.rejected.type, payload: errorMessage };
            const nextState = exchangeReducer(initialState, action);
            expect(nextState.loading).toBe('failed');
            expect(nextState.error).toBe(errorMessage);
            expect(nextState.exchangeData).toBeNull();
        });
    });

    describe('updateExchangeRates extraReducers', () => {
        const preUpdateState: ExchangeState = {
            exchangeData: mockExchangeData,
            loading: 'succeeded',
            error: null,
        };

        const updatedData: ExchangeData = {
            ...mockExchangeData,
            rates: [{ currency: 'ABC', buy: 1.3, sell: 1.4 }],
            last_updated: new Date().toISOString(),
        };

        it('should set loading to pending when updateExchangeRates is pending', () => {
            const action = { type: updateExchangeRates.pending.type };
            const nextState = exchangeReducer(preUpdateState, action);
            expect(nextState.loading).toBe('pending');
            expect(nextState.error).toBeNull();
        });

        it('should update exchangeData when updateExchangeRates is fulfilled', () => {
            const action = { type: updateExchangeRates.fulfilled.type, payload: updatedData };
            const nextState = exchangeReducer(preUpdateState, action);
            expect(nextState.loading).toBe('succeeded');
            expect(nextState.exchangeData).toEqual(updatedData);
        });

        it('should set an error when updateExchangeRates is rejected', () => {
            const errorMessage = 'Failed to update rates';
            const action = { type: updateExchangeRates.rejected.type, payload: errorMessage };
            const nextState = exchangeReducer(preUpdateState, action);
            expect(nextState.loading).toBe('failed');
            expect(nextState.error).toBe(errorMessage);
            // The old data should remain in case of a failed update
            expect(nextState.exchangeData).toEqual(mockExchangeData);
        });
    });
});
