import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { fetchExchangeData } from '../../thunks/exchangeThunks/fetchExchangeDataThunk';
import { updateExchangeRates } from '../../thunks/exchangeThunks/updateExchangeRatesThunk';
import { updateExchangeDetails } from '../../thunks/exchangeThunks/updateExchangeDetailsThunk';
import type { Rate, ConversionRow, ExchangeData } from '../../types/exchange';
import { calculateConversion, loadConverterRowsFromStorage, syncConverterRowsWithRates } from '../../utils/exchangeUtils';
import { MINIMUM_RATE_ROWS } from '../../appConfig';

// --- Default objects for initializing new rows ---
const ratesRowDefault = { currency: '', buy: 0.00, sell: 0.00 };
const converterRowDefault = { fromCurrency: '', toCurrency: '', fromValue: 0.00, toValue: 0.00 };


/** Defines the complete state shape for the 'exchange' slice of the Redux store. */
export interface ExchangeState {
    /** The core data for the user's exchange, fetched from the API. */
    exchangeData: ExchangeData | null;
    /** The array of rates currently displayed and edited in the UI. */
    displayRates: Rate[];
    /** The current loading state for asynchronous operations (e.g., fetching, saving). */
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    /** Any error message from a failed asynchronous operation. */
    error: string | null;
    /** The active tab in the converter component. */
    converterMode: 'convert' | 'findOut';
    /** The state of all rows in both converter tabs. */
    converterState: { convert: ConversionRow[], findOut: ConversionRow[] };
}

// --- Initial State ---
const initialState: ExchangeState = {
    exchangeData: null,
    displayRates: [],
    loading: 'idle',
    error: null,
    converterMode: 'convert',
    /** The converter state is hydrated from localStorage on initial load. */
    converterState: {
        convert: loadConverterRowsFromStorage('convert', [converterRowDefault]),
        findOut: loadConverterRowsFromStorage('findOut', [converterRowDefault]),
    },
};

/**
 * A reusable helper function to recalculate a single converter row.
 * This is not a reducer itself but is called by other reducers.
 * @param state - The current slice state.
 * @param index - The index of the row to recalculate.
 */
const recalculateSingleConverterRow = (state: ExchangeState, index: number) => {
    const ratesForConversion = [
        ...state.displayRates,
        { currency: state.exchangeData?.base_currency ?? 'USD', buy: 1, sell: 1 }
    ];
    
    const rowToRecalculate = state.converterState[state.converterMode][index];
    if (!rowToRecalculate) return; // Safety check

    const recalculatedRow = calculateConversion(rowToRecalculate, state.converterMode, ratesForConversion);
    
    state.converterState[state.converterMode][index] = recalculatedRow;
};


/**
 * Creates the Redux slice for managing the entire state of the exchange page,
 * including rates, the converter, and async operation status.
 */
const exchangeSlice = createSlice({
    name: 'exchange',
    initialState,
    /**
     * Reducers for synchronous state updates. These actions are dispatched directly from the UI.
     * Redux Toolkit's Immer library allows us to write "mutating" logic that it
     * safely converts into immutable updates.
     */
    reducers: {
        /** Resets the entire exchange state, typically on user logout. */
        clearExchangeData: (state) => {
            state.exchangeData = null;
            state.displayRates = [];
            state.loading = 'idle';
            state.error = null;
        },

        // ========== Rates Reducers ==========
        /** Directly sets the entire `displayRates` array. */
        setDisplayRates: (state, action: PayloadAction<Rate[]>) => {
            state.displayRates = action.payload;
        },
        /** Updates a single property of a specific rate row in the `displayRates` array. */
        updateDisplayRate: (state, action: PayloadAction<{ index: number; rate: Partial<Rate> }>) => {
            const { index, rate } = action.payload;
            state.displayRates[index] = { ...state.displayRates[index], ...rate };
        },
        /** Adds a new, empty rate row to the end of the `displayRates` array. */
        addDisplayRateRow: (state) => {
            state.displayRates.push({ ...ratesRowDefault });
        },
        /** Removes a rate row from the `displayRates` array by its index. */
        removeDisplayRateRow: (state, action: PayloadAction<number>) => {
            state.displayRates = state.displayRates.filter((_, i) => i !== action.payload);
        },
        /** Resets a specific rate row to its default empty state. */
        resetDisplayRateRow: (state, action: PayloadAction<number>) => {
            state.displayRates[action.payload] = { ...ratesRowDefault };
        },
        /** Resets all rate rows to their default empty state. */
        resetAllDisplayRates: (state) => {
            state.displayRates = state.displayRates.map(() => ({ ...ratesRowDefault }));
        },

        // =========== Converter Reducers ==========
        /** Sets the active tab of the converter. */
        setConverterMode: (state, action: PayloadAction<'convert' | 'findOut'>) => {
            state.converterMode = action.payload;
        },
        /** Directly sets the entire array of rows for the currently active converter tab. */
        setConverterRows: (state, action: PayloadAction<ConversionRow[]>) => {
            state.converterState[state.converterMode] = action.payload;
        },
        /** Adds a new, empty row to the currently active converter tab. */
        addConverterRow: (state) => {
            state.converterState[state.converterMode].push({ ...converterRowDefault });
        },
        /** Updates the input value of a specific row in the active converter tab. */
        updateConverterValue: (state, action: PayloadAction<{ index: number; value: number }>) => {
            const { index, value } = action.payload;
            const row = state.converterState[state.converterMode][index];
            if (state.converterMode === 'convert') {
                row.fromValue = value;
            } else {
                row.toValue = value;
            }
            recalculateSingleConverterRow(state, index);
        },
        /** Updates the selected currency of a row, intelligently swapping if the selected currency is already in use. */
        updateConverterCurrency: (state, action: PayloadAction<{ index: number; type: 'from' | 'to'; currency: string }>) => {
            const { index, type, currency } = action.payload;
            const row = state.converterState[state.converterMode][index];
            
            if (type === 'from') {
                if (currency === row.toCurrency) row.toCurrency = row.fromCurrency;
                row.fromCurrency = currency;
            } else {
                if (currency === row.fromCurrency) row.fromCurrency = row.toCurrency;
                row.toCurrency = currency;
            }
            // --- 2. Immediately recalculate the values for the updated row ---
            recalculateSingleConverterRow(state, index);
        },
        /** Removes a row from the active converter tab by its index. */
        removeConverterRow: (state, action: PayloadAction<number>) => {
            const { converterMode, converterState } = state;
            converterState[converterMode] = converterState[converterMode].filter((_, i) => i !== action.payload);
        },
        /** Resets the input value of a specific converter row to zero. */
        resetConverterRow: (state, action: PayloadAction<number>) => {
            const { converterMode, converterState } = state;
            const row = converterState[converterMode][action.payload];
            if (converterMode === 'convert') {
                row.fromValue = 0;
            } else {
                row.toValue = 0;
            }
        },
        /**
         * The main calculation engine. It syncs the converter rows with available currencies
         * and recalculates all conversion values for both tabs.
         */
        recalculateConverter: (state) => {
            const ratesForConversion = [
                ...state.displayRates,
                { currency: state.exchangeData?.base_currency ?? 'USD', buy: 1, sell: 1 }
            ];
            const availableCurrencyCodes = new Set(ratesForConversion.map(r => r.currency));

            ['convert', 'findOut'].forEach(mode => {
                const typedMode = mode as 'convert' | 'findOut';
                let syncedRows = syncConverterRowsWithRates(state.converterState[typedMode], availableCurrencyCodes);
                if (syncedRows.length === 0) {
                    syncedRows = [{ ...converterRowDefault }];
                }
                
                state.converterState[typedMode] = syncedRows.map(row => 
                    calculateConversion(row, typedMode, ratesForConversion)
                );
            });
        },
    },
    /**
     * Handlers for actions defined outside of this slice, primarily for handling the
     * lifecycle of async thunks (`pending`, `fulfilled`, `rejected`).
     */
    extraReducers: (builder) => {
        builder
            // --- Handlers for fetching data ---
            .addCase(fetchExchangeData.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(fetchExchangeData.fulfilled, (state, action: PayloadAction<ExchangeData>) => {
                state.loading = 'succeeded';
                state.exchangeData = action.payload;

                // Initialize the UI rates table with fetched data, ensuring minimum rows.
                let finalRates = [...action.payload.rates];
                while (finalRates.length < MINIMUM_RATE_ROWS) {
                    finalRates.push({ ...ratesRowDefault });
                }
                state.displayRates = finalRates;
                // Trigger a recalculation of the converter with the new rates.
                exchangeSlice.caseReducers.recalculateConverter(state);
            })
            .addCase(fetchExchangeData.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload ?? 'An unknown error occurred';
            })

            // --- Handlers for updating rates ---
            .addCase(updateExchangeRates.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(updateExchangeRates.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                if (state.exchangeData) {
                    state.exchangeData.last_updated = action.payload.last_updated;
                }
                // Trigger a recalculation after a successful save.
                exchangeSlice.caseReducers.recalculateConverter(state);
            })
            .addCase(updateExchangeRates.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload ?? 'An unknown error occurred';
            })
            // --- Handlers for updating exchange details ---
            .addCase(updateExchangeDetails.pending, (state) => {
                state.loading = 'pending';
            })
            .addCase(updateExchangeDetails.fulfilled, (state, action: PayloadAction<ExchangeData>) => {
                state.loading = 'succeeded';
                state.exchangeData = action.payload;
            })
            .addCase(updateExchangeDetails.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload ?? 'An unknown error occurred';
            })
            /**
             * A matcher that runs the `recalculateConverter` logic in response to a list
             * of different actions. This keeps the converter state always in sync.
             */
            .addMatcher(
                (action) => [
                    'exchange/updateDisplayRate',
                    'exchange/setConverterMode',
                    'exchange/resetConverterRow'
                ].includes(action.type),
                (state) => {
                    exchangeSlice.caseReducers.recalculateConverter(state);
                }
            )
    },
});

// Export all the auto-generated action creators for use in components.
export const { 
    clearExchangeData, setDisplayRates, updateDisplayRate, addDisplayRateRow, 
    removeDisplayRateRow, resetDisplayRateRow, resetAllDisplayRates,
    setConverterMode, setConverterRows, addConverterRow, recalculateConverter,
    updateConverterValue, updateConverterCurrency, removeConverterRow, resetConverterRow
} = exchangeSlice.actions;

export default exchangeSlice.reducer;