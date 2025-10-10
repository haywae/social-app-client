/** Defines the shape of the core exchange data fetched from the server. */
export interface ExchangeData {
    username:string;
    avatarUrl: string;
    name: string;
    country: string;
    base_currency: string;
    rates: Rate[];
    last_updated: string; // ISO 8601 date string
}

/** Defines the shape of a single exchange rate object. */
export interface Rate {
    currency: string;
    buy: number;
    sell: number;
}

/** Defines the shape of the data for a single row in the converter UI. */
export interface ConversionRow {
    fromCurrency: string;
    toCurrency: string;
    fromValue: number | string;
    toValue: number | string;
}

