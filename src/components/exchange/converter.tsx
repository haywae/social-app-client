import { type JSX } from "react";
import CurrencyDropdown from "./currencyDropdown";
import { type CurrencyItem } from "../../assets/currencies";
import { RightArrowIcon, CopyIcon, CloseIcon, RefreshIcon } from "../../assets/icons";
import { CurrencyInput } from "./currencyInput";
import "../common/cDropdown.css"
import type { ConversionRow } from "../../types/exchange";

/** Props for the Converter component. */
interface ConverterProps {
    /** The active mode, determining which side of the converter is the input. */
    mode: 'convert' | 'findOut';
    /** The array of ConversionRow data to render. */
    rows: ConversionRow[];
    /** The filtered list of currencies available for selection in the dropdowns. */
    availableCurrencies: CurrencyItem[];
    /** Callback for when an input value is changed by the user. */
    onValueChange: (index: number, value: number) => void;
    /** Callback for when a currency selection is changed. */
    onCurrencyChange: (index: number, type: 'from' | 'to', currency: CurrencyItem) => void;
    /** Callback to remove a specific row. */
    onRemoveRow: (index: number) => void;
    /** Callback to reset a specific row's input value. */
    onResetRow: (index: number) => void;
}

/** Props for the local FormattedOutput component. */
interface FormattedOutputProps {
  value: string | number;
  currencySymbol?: string;
}

/**
 * A presentational component that renders the currency converter interface.
 * It displays rows for converting values between different currencies based on the provided rates.
 * All state logic is handled by a parent component via callback props.
 *
 * @param props The props for the component, including the current mode, data rows, and event handlers.
 */
const Converter = ({mode, rows, availableCurrencies, onValueChange, onCurrencyChange, onRemoveRow, onResetRow}: ConverterProps) : JSX.Element => {

    /** A local component to display a formatted, non-interactive numeric value. */
    const FormattedOutput = ({ value , currencySymbol = ''}: FormattedOutputProps): JSX.Element => {
        const formatted = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true,
        }).format(Number(value) || 0);
        return <div className="conversion-output-box">{currencySymbol}{formatted}</div>;
    };

    /** A helper function to copy a formatted numeric value to the clipboard. */
    const copyValue = (value: string | number) => {
        const formatted = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2,
            useGrouping: true,
        }).format(Number(value) || 0);
        navigator.clipboard.writeText(formatted);
    };

    /** A helper function to find the currency symbol for a given ISO code. */
    const getCurrencySymbol = (currencyCode: string) => {
        const currency = availableCurrencies.find(c => c.iso3 === currencyCode);
        return currency ? currency.symbol : '';
    };

    return( 
        <div className="converter-body">
            {/* Column Titles */}
            <div className="converter-column-title">
                <div className="from-title">From</div>
                <div className="to-title">To</div>
            </div>
            {/* Map over the rows data to render each conversion row */}
            {rows.map((row, index) => (
                <div className="converter-row" key={index}>
                    {/* Section for currency dropdowns and action icons */}
                    <div className="converter-options">
                        <div className="left-column">
                             <CurrencyDropdown
                                selectedCurrency={availableCurrencies.find(c => c.iso3 === row.fromCurrency)}
                                onSelect={(currency) => onCurrencyChange(index, 'from', currency)}
                                currencies={availableCurrencies}
                            />
                            <div className="converter-row-actions">
                                {mode === 'findOut' && <CopyIcon className="action-icon" onClick={() => copyValue(row.fromValue)} />}
                            </div>
                        </div>
                         <div className="right-column">
                             <CurrencyDropdown
                                selectedCurrency={availableCurrencies.find(c => c.iso3 === row.toCurrency)}
                                onSelect={(currency) => onCurrencyChange(index, 'to', currency)}
                                currencies={availableCurrencies}
                            />
                            <div className="converter-row-actions">
                                {mode === 'convert' && <CopyIcon className="action-icon" onClick={() => copyValue(row.toValue)} />}
                                <RefreshIcon className="action-icon" onClick={() => onResetRow(index)} />
                                {index > 0 && <CloseIcon className="action-icon close-row-icon" onClick={() => onRemoveRow(index)} />}
                            </div>
                        </div>
                    </div>
                    {/* Section for numeric inputs and outputs */}
                    <div className="converter-values">
                         <div className="left-column">
                             {/* In 'convert' mode, the "from" side is an input. Otherwise, it's a formatted output. */}
                             {mode === 'convert' ? (
                                <CurrencyInput
                                    value={row.fromValue}
                                    onValueChange={(newValue) => onValueChange(index, newValue)}
                                    useGrouping={true}
                                    currencySymbol={getCurrencySymbol(row.fromCurrency)}
                                />
                            ) : (
                                <FormattedOutput 
                                    value={row.fromValue} 
                                    currencySymbol={getCurrencySymbol(row.fromCurrency)}
                                />
                            )}
                        </div>
                        <div className="middle-column-static"><RightArrowIcon/></div>
                         <div className="right-column">
                             {/* In 'convert' mode, the "to" side is a formatted output. Otherwise, it's an input. */}
                             {mode === 'convert' ? (
                                <FormattedOutput 
                                    value={row.toValue} 
                                    currencySymbol={getCurrencySymbol(row.toCurrency)}
                                />
                            ) : (
                                <CurrencyInput
                                    value={row.toValue}
                                    onValueChange={(newValue) => onValueChange(index, newValue)}
                                    useGrouping={true}
                                    currencySymbol={getCurrencySymbol(row.toCurrency)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
};

export default Converter;