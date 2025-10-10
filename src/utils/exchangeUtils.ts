import type { ConversionRow, Rate } from "../types/exchange";

/**
 * Calculates the result of a currency conversion for a single row.
 * It operates in two modes: 'convert' (calculating the output from the input)
 * and 'findOut' (calculating the required input for a desired output).
 *
 * @param row - The ConversionRow object containing the currencies and one of the values.
 * @param mode - The calculation mode, either 'convert' or 'findOut'.
 * @param rates - The complete list of available exchange rates for the calculation.
 * @returns A new ConversionRow object with the calculated value filled in.
 */
export const calculateConversion = (row: ConversionRow, mode: 'convert' | 'findOut', rates: Rate[]): ConversionRow => {
    // Find the full rate objects for the selected 'from' and 'to' currencies.
    const fromRate = rates.find(r => r.currency === row.fromCurrency);
    const toRate = rates.find(r => r.currency === row.toCurrency);
    // ✅ If either currency is not selected or its rate cannot be found,
    // return the original row without making any changes.
    if (!fromRate || !toRate) {
        return row;
    }

    // If the rates exist but are zero (which would cause a division-by-zero error),
    // return the row with an empty value to indicate an invalid calculation.
    if (fromRate.buy === 0 || toRate.sell === 0) {
        return { ...row, ...(mode === 'convert' ? { toValue: '' } : { fromValue: '' }) };
    }

    // --- 'convert' Mode ---
    if (mode === 'convert') {
        const fromValueNum = parseFloat(row.fromValue as string);

        if (isNaN(fromValueNum) || fromValueNum === 0) {
            return { ...row, toValue: '0.00' };
        } 
        const result = (fromValueNum * fromRate.buy) / toRate.sell;
        return { ...row, toValue: result.toFixed(2) };
    } 
    // --- 'findOut' Mode ---
    else {
        const toValueNum = parseFloat(row.toValue as string);

        if (isNaN(toValueNum) || toValueNum === 0) {
            return { ...row, fromValue: '0.00' };
        }
        const result = (toValueNum * toRate.sell) / fromRate.buy;
        return { ...row, fromValue: result.toFixed(2) };
    }
};

// --- Local Storage Keys ---
const CONVERTER_CONVERT_KEY = 'converter_convert_rows';
const CONVERTER_FINDOUT_KEY = 'converter_findout_rows';


/**
 * Saves a specific set of converter rows to local storage.
 * @param mode - Determines which key to use ('convert' or 'findOut').
 * @param rows - The array of conversion rows to save.
 */
export const saveConverterRowsToStorage = (mode: 'convert' | 'findOut', rows: ConversionRow[]): void => {
    try {
        // Filter out any incomplete rows before saving
        const validRows = rows.filter(r => r.fromCurrency && r.toCurrency);
        const key = mode === 'convert' ? CONVERTER_CONVERT_KEY : CONVERTER_FINDOUT_KEY;
        window.localStorage.setItem(key, JSON.stringify(validRows));
    } catch (error) {
        console.error("Error saving to localStorage", error);
    }
};

/**
 * Loads converter rows from local storage.
 * @param mode - Determines which key to load from ('convert' or 'findOut').
 * @param defaultValue - The default row(s) to return if nothing is in storage.
 * @returns The loaded or default rows.
 */
export const loadConverterRowsFromStorage = (mode: 'convert' | 'findOut', defaultValue: ConversionRow[]): ConversionRow[] => {
    try {
        const key = mode === 'convert' ? CONVERTER_CONVERT_KEY : CONVERTER_FINDOUT_KEY;
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error("Error reading from localStorage", error);
        return defaultValue;
    }
};


/**
 * Synchronizes converter rows with the currently available rates.
 * It removes any rows that contain currencies no longer in the rates list.
 * @param rows - The current converter rows.
 * @param availableCurrencyCodes - A Set of currently valid currency codes.
 * @returns A new array of synchronized rows.
 */
export const syncConverterRowsWithRates = (rows: ConversionRow[], availableCurrencyCodes: Set<string>): ConversionRow[] => {
    return rows.filter(row =>
        availableCurrencyCodes.has(row.fromCurrency) &&
        availableCurrencyCodes.has(row.toCurrency)
    );
};




/**
 * Transforms an array of rate objects from the frontend format 
 * (e.g., { currency, buy, sell }) to the backend API format 
 * (e.g., { currency_code, buy_rate, sell_rate }).
 *
 * @param {object} updateData - The object containing the rates array.
 * @returns {object} A new object with the transformed rates array.
 */
export const transformRatesForApi = (updateData: {rates:Rate[]}) => {
  // Use .map() to iterate over the rates and create a new array
  const transformedRates = updateData.rates.map(rate => ({
    currency_code: rate.currency,
    buy_rate: rate.buy,
    sell_rate: rate.sell
  }));

  // Return a new object with the transformed rates
  return { rates: transformedRates };
};