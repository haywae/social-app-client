import type { JSX } from "react";
import { useAppSelector, useAppDispatch, useTitle } from "../utils/hooks";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import { openModal } from "../slices/ui/uiSlice";
import Converter from "../components/exchange/converter";
import RatesTable from "../components/exchange/ratesTable";
import RatesCardSkeleton from "../components/exchange/ratesCardSkeleton";
import ExchangeOptionsMenu from "../components/exchange/exchangeOptionsMenu";
import { setError, setSuccess } from "../slices/ui/uiSlice";
import { allCountries } from "../assets/countries";
import { allCurrencies, type CurrencyItem } from "../assets/currencies";
import { AddIcon, CloudArrowDownIcon, EllipseIcon } from "../assets/icons";
import { fetchExchangeData } from "../thunks/exchangeThunks/fetchExchangeDataThunk";
import { updateExchangeRates } from "../thunks/exchangeThunks/updateExchangeRatesThunk";
import { createPost } from "../thunks/postsThunks/createPostThunk";
import { updateDisplayRate, addDisplayRateRow, removeDisplayRateRow, resetDisplayRateRow } from "../slices/exchange/exchangeSlice";
import { setConverterMode, addConverterRow, updateConverterValue, updateConverterCurrency, resetConverterRow, removeConverterRow } from "../slices/exchange/exchangeSlice";
import type { Rate } from "../types/exchange";
import "../styles/exchangePage.css";


import { IMAGE_BASE_URL, MINIMUM_RATE_ROWS } from "../appConfig";
import { DEFAULT_AVATAR_URL } from "../appConfig";
import { fetchDiscoveryData } from "../thunks/searchThunks/fetchDiscoveryThunk";

const ExchangePage = (): JSX.Element => {
    const { exchangeData, loading, displayRates, converterMode, converterState } = useAppSelector((state) => state.exchange)
    const user = useAppSelector((state) => state.auth.user)
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [latestRate, setLatestRate] = useState<'idle' | 'pending' | 'failed' | 'succeeded'>('idle');

    /**  This runs once when the component mounts and fetches the initial data. */
    useEffect(() => {
        dispatch(fetchExchangeData());
    }, [dispatch]);

    useTitle('Exchange - WolexChange');

    /** The user's base country object obtained with the exchange data's country key or base_currrency key. */
    const baseCountry = useMemo(() =>
        allCountries.find(c => c.name === exchangeData?.country) || null,
        [exchangeData?.country, exchangeData?.base_currency]
    );

    /**  The user's base currency obtained from the base country object. */
    const baseCurrencyCode = baseCountry?.currencyCode ?? 'USD';

    /** The full list of rates used for calculation, including the base currency at a 1:1 rate. */
    const ratesForConversion = useMemo(() => [
        ...displayRates,
        { currency: baseCurrencyCode, buy: 1, sell: 1 }
    ], [displayRates, baseCurrencyCode]);

    /** The currencies to be displayed in the rates dropdown. */
    const rateCurrencyOptions = useMemo(() => {
        return allCurrencies.filter(c => c.iso3 !== baseCurrencyCode);
    }, [baseCurrencyCode]);

    /** The currencies to be displayed in the converter dropdown. */
    const converterCurrencyOptions = useMemo(() => {
        const currencyCodesInRates = new Set(ratesForConversion.map(r => r.currency));
        return allCurrencies.filter(currency => currencyCodesInRates.has(currency.iso3));
    }, [ratesForConversion]);

    //========== RATES COMPONENT HANDLERS ==========
    /** This function dispatches the action to open the modal via the ModalManager */
    const handleOpenEditModal = () => {
        setIsMenuOpen(false); // Close the popover first
        dispatch(openModal({
            modalType: 'EDIT_EXCHANGE_DETAILS',
            modalProps: { exchangeData }
        }));
    };

    /**
     * Updates a rate's 'buy' or 'sell' value in the Redux state and
     * triggers a database save if the entire row becomes valid.
     */
    const handleRateChange = (index: number, type: 'buy' | 'sell', value: number) => {
        const newRates = [...displayRates];
        const updatedRate = { ...newRates[index], [type]: value };
        newRates[index] = updatedRate;

        dispatch(updateDisplayRate({ index, rate: { [type]: value } }));

        if (updatedRate.currency && updatedRate.buy > 0 && updatedRate.sell > 0) {
            const validRatesToUpdate = newRates.filter((rate: Rate) => rate.currency && rate.buy > 0 && rate.sell > 0);
            dispatch(updateExchangeRates({ rates: validRatesToUpdate }));
        }
    };

    /**
     * Updates a rate's selected currency in the Redux state and
     * triggers a database save if the entire row is already valid.
     */
    const handleCurrencyChange = (currency: CurrencyItem, index: number) => {
        const newRates = [...displayRates];
        const updatedRate = { ...newRates[index], currency: currency.iso3 };
        newRates[index] = updatedRate;

        dispatch(updateDisplayRate({ index, rate: { currency: currency.iso3 } }));

        if (updatedRate.buy > 0 && updatedRate.sell > 0) {
            const validRatesToUpdate = newRates.filter((rate: Rate) => rate.currency && rate.buy > 0 && rate.sell > 0);
            dispatch(updateExchangeRates({ rates: validRatesToUpdate }));
        }
    };

    /** Dispatches an action to add a new, empty row to the rates table UI. */
    const addRateRow = () => dispatch(addDisplayRateRow());

    /**
     * Removes a row from the rates table. If the removed row was a valid,
     * saved rate, it triggers a database update with the remaining rates.
     */
    const removeRateRow = (index: number) => {
        const originalRate = displayRates[index];
        const wasOriginallyValid = originalRate?.currency && originalRate.buy > 0 && originalRate.sell > 0;

        dispatch(removeDisplayRateRow(index));

        if (wasOriginallyValid) {
            const newRatesAfterRemoval = displayRates.filter((_: Rate, i: number) => i !== index);
            const validRatesToUpdate = newRatesAfterRemoval.filter((rate: Rate) => rate.currency && rate.buy > 0 && rate.sell > 0);
            dispatch(updateExchangeRates({ rates: validRatesToUpdate }));
        }
    };

    /**
     * Resets a single row to its default state. If the reset row was valid,
     * it triggers a database save to effectively remove it.
     */
    const resetRateRow = (index: number) => {
        const originalRate = displayRates[index];
        const wasOriginallyValid = originalRate?.currency && originalRate.buy > 0 && originalRate.sell > 0;

        dispatch(resetDisplayRateRow(index));

        if (wasOriginallyValid) {
            const newRatesAfterReset = [...displayRates];
            newRatesAfterReset[index] = { currency: '', buy: 0.00, sell: 0.00 };
            const validRatesToUpdate = newRatesAfterReset.filter((rate: Rate) => rate.currency && rate.buy > 0 && rate.sell > 0);
            dispatch(updateExchangeRates({ rates: validRatesToUpdate }));
        }
    };

    /** Fetches the latest exchange rates from the database */
    const fetchLatestRates = async () => {
        setLatestRate('pending')
        try {
            await dispatch(fetchExchangeData()).unwrap();
            dispatch(setSuccess('Rates refreshed !'))
        } catch (error) {
            dispatch(setError('Refresh failed'));
        }
        // Reset the status to idle after 3 seconds
        setTimeout(() => {
            setLatestRate('idle');
        }, 3000);
    };

    // --- HANDLER FOR POSTING RATES ---
    const handlePostRates = async () => {
        setIsMenuOpen(false);
        const validRates = displayRates.filter(rate => rate.currency && rate.buy > 0 && rate.sell > 0);
        if (validRates.length === 0) {
            dispatch(setError("You have no valid rates to post."));
            return;
        }

        // 1. Format the rates into a string, now with dynamic flag emojis
        const ratesText = validRates.map(rate => {
            const currencyToDisplay = converterCurrencyOptions.find(currency => currency.iso3 === rate.currency)
            return `${currencyToDisplay?.symbol} ${rate.currency}\nBuy: ${rate.buy.toFixed(2)} | Sell: ${rate.sell.toFixed(2)}`;
        }).join('\n\n'); // Use double newline for better spacing

        // 2. Create the hashtags
        const allCurrencies = [baseCurrencyCode, ...validRates.map(r => r.currency)];
        const uniqueCurrencies = [...new Set(allCurrencies)];

        // 3. Combine everything into the final post content
        const postContent = `${ratesText}`;

        try {
            // 4. Dispatch the createPost thunk
            const result = await dispatch(createPost({ content: postContent, tags: uniqueCurrencies, postType: 'RATE_POST' })).unwrap();
            dispatch(setSuccess("Rates posted successfully!"));
            dispatch(fetchDiscoveryData())
            // 5. Navigate to the new post's detail page
            navigate(`/post/${result.id}`);
        } catch (err) {
            dispatch(setError("Failed to post rates. Please try again."));
        }
    };

    //========== CONVERTER SECTION HANDLERS ==========

    /** Dispatches an action to set the converter's active mode ('convert' or 'findOut'). */
    const handleSetConverterMode = (mode: 'convert' | 'findOut') => {
        dispatch(setConverterMode(mode));
    };

    /** Dispatches an action to add a new, empty row to the active converter tab. */
    const handleAddConverterRow = () => {
        dispatch(addConverterRow());
    };

    /** Dispatches an action to update the input value of a specific converter row. */
    const handleConverterValueChange = (index: number, value: number) => {
        dispatch(updateConverterValue({ index, value }));
    };

    /** Dispatches an action to update the 'from' or 'to' currency of a converter row. */
    const handleConverterCurrencyChange = (index: number, type: 'from' | 'to', currency: CurrencyItem) => {
        dispatch(updateConverterCurrency({ index, type, currency: currency.iso3 }));
    };

    /** Dispatches an action to remove a row from the active converter tab. */
    const handleRemoveConverterRow = (index: number) => {
        dispatch(removeConverterRow(index));
    };

    /** Dispatches an action to reset the input value of a specific converter row to zero. */
    const handleResetConverterRow = (index: number) => {
        dispatch(resetConverterRow(index));
    };

    return (
        <div className="exchange-page-container">
            {/*Rates Section*/}
            <section className="rates-section card">
                {loading === 'pending' && !exchangeData ? (
                    <RatesCardSkeleton />
                ) : (
                    <>
                        <h2 className="rates-title">Rates</h2>

                        {/* Rates Header */}
                        <div className="rates-header">
                            <img
                                src={user?.profilePictureUrl ? `${IMAGE_BASE_URL}/${user.profilePictureUrl}` : DEFAULT_AVATAR_URL}
                                alt="user-avatar"
                                className="user-avatar avatar-md"
                            />
                            <div className="exchange-info">
                                <Link to="#" className="profile-link">
                                    {baseCountry && <span className="country">
                                        <img src={`https://flagcdn.com/w20/${baseCountry?.iso2.toLowerCase()}.png`} alt={`${baseCountry?.name} flag`} className="flag-img" />
                                    </span>}
                                    <span className="display-name">{exchangeData?.name}</span>
                                </Link>
                            </div>
                            <div className="options-menu-container">
                                <button className="icon-action-button" onClick={() => setIsMenuOpen(true)}>
                                    <EllipseIcon />
                                </button>
                                {isMenuOpen && (
                                    <ExchangeOptionsMenu username={user?.username}
                                        onClose={() => setIsMenuOpen(false)}
                                        onEditClick={handleOpenEditModal}
                                        onPostRatesClick={handlePostRates}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Rates Table */}
                        <RatesTable
                            displayRates={displayRates} handleCurrencyChange={handleCurrencyChange} handleRateChange={handleRateChange}
                            resetRateRow={resetRateRow} removeRateRow={removeRateRow} addRateRow={addRateRow}
                            rateCurrencyOptions={rateCurrencyOptions} MINIMUM_RATE_ROWS={MINIMUM_RATE_ROWS}
                        />

                        {/* Rates Footer */}
                        <div className="footer-section">
                            <span>Last Updated at: {exchangeData?.last_updated ? new Date(exchangeData.last_updated).toLocaleString() : ''}</span>
                            <span className="refresh-rate">
                                {latestRate === 'pending' && 'Refreshing...'}
                                {(latestRate === 'idle') && <CloudArrowDownIcon onClick={fetchLatestRates} />}
                            </span>
                        </div>
                    </>)}
            </section>

            {/* Converter Section */}
            <section className="converter-section card">
                <div className="converter-header">
                    <div className="converter-tabs">
                        <span className={converterMode === 'convert' ? 'active' : ''} onClick={() => handleSetConverterMode('convert')}>Convert</span>
                        <span className={converterMode === 'findOut' ? 'active' : ''} onClick={() => handleSetConverterMode('findOut')}>Find Out</span>
                    </div>
                    <div className="converter-actions add-row-icon">
                        <AddIcon onClick={handleAddConverterRow} />
                    </div>
                </div>
                <Converter
                    mode={converterMode} rows={converterState[converterMode]} availableCurrencies={converterCurrencyOptions}
                    onValueChange={handleConverterValueChange} onCurrencyChange={handleConverterCurrencyChange}
                    onRemoveRow={handleRemoveConverterRow} onResetRow={handleResetConverterRow}
                />
            </section>
        </div>
    )
};

export default ExchangePage;