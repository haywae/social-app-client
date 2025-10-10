import type { Rate } from "../../types/exchange";
import type { CurrencyItem } from "../../assets/currencies";
import CurrencyDropdown from "./currencyDropdown";
import { CurrencyInput } from "./currencyInput";
import { AddIcon, CloseIcon, RefreshIcon } from "../../assets/icons";
import { allCurrencies } from "../../assets/currencies";

/** Props for the RatesTable component. */
interface RatesTableProps {
    /** The array of rate objects to be rendered in the table. */
    displayRates: Rate[];
    /** Callback function triggered when a currency is selected from a dropdown. */
    handleCurrencyChange: (currency: CurrencyItem, index: number) => void;
    /** Callback function triggered when a 'buy' or 'sell' value is changed. */
    handleRateChange: (index: number, type: 'buy' | 'sell', value: number) => void;
    /** Callback function to reset a specific row to its default empty state. */
    resetRateRow: (index: number) => void;
    /** Callback function to remove a specific row from the table. */
    removeRateRow: (index: number) => void;
    /** Callback function to add a new empty row to the table. */
    addRateRow: () => void;
    /** The filtered list of currencies to display in each row's dropdown. */
    rateCurrencyOptions: CurrencyItem[];
    /** A number used to control logic, like preventing rows from being deleted. */
    MINIMUM_RATE_ROWS: number;
}

/**
 * Renders a dynamic table for managing currency exchange rates.
 * This is a "presentational" component that receives all its data and handler
 * functions as props from a parent component (like ExchangePage).
 *
 * @param props The props for the component, including the rates data and event handlers.
 */
const RatesTable = ({
    displayRates, handleCurrencyChange, handleRateChange, resetRateRow,
    removeRateRow, addRateRow, rateCurrencyOptions, MINIMUM_RATE_ROWS
}: RatesTableProps) => {
    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Currency</th>
                        <th>Buy</th>
                        <th>Sell</th>
                        <th className="action-cell add-row-icon" onClick={addRateRow}><AddIcon /></th>
                    </tr>
                </thead>
                <tbody>
                    {displayRates.map((rate, index) => (
                        <tr key={rate.currency || index}>
                            <td>
                                <CurrencyDropdown
                                    selectedCurrency={allCurrencies.find(c => c.iso3 === rate.currency)}
                                    onSelect={(currency) => handleCurrencyChange(currency, index)}
                                    currencies={rateCurrencyOptions}
                                />
                            </td>
                            <td>
                                <CurrencyInput 
                                    value={rate.buy}
                                    onValueChange={(newValue: number) => handleRateChange(index, 'buy', newValue)}
                                />
                            </td>
                            <td>
                                <CurrencyInput 
                                    value={rate.sell}
                                    onValueChange={(newValue) => handleRateChange(index, 'sell', newValue)}
                                />
                            </td>
                            <td className="action-cell">
                                <div className="action-cell-icons">
                                    <RefreshIcon onClick={() => resetRateRow(index)} />
                                    {index >= MINIMUM_RATE_ROWS && <CloseIcon className="close-row-icon" onClick={() => removeRateRow(index)} />}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RatesTable;