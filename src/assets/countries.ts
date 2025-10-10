/**
 * A comprehensive list of countries with their names, ISO 3166-1 alpha-2 codes,
 * and ISO 4217 currency codes.
 */
import country from 'country-list-js';

export interface CountryItem {
  name: string;
  iso2: string;
  iso3: string;
  currencyCode: string;
}

// Define the raw shape from country-list-js
interface RawCountry {
  name: string;
  iso2: string;
  iso3: string;
  currency: string;
  // other fields omitted
}


export const allCountries: CountryItem[] = Object.values(country.all as Record<string, RawCountry>)
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((c) => ({
    name: c.name,
    iso2: c.iso2,
    iso3: c.iso3,
    currencyCode: c.currency,
  }));

