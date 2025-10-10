import { useState, useEffect, useRef, type JSX } from "react";

/** Props for the CurrencyInput component. */
interface CurrencyInputProps {
  /** The externally controlled numeric value for the input. */
  value: number | string;
  /** Callback function to notify the parent of a committed numeric value change. */
  onValueChange: (value: number) => void;
  /** If true, formats the number with thousands separators (e.g., 1,234.56). */
  useGrouping?: boolean;
  /** An optional currency symbol to display next to the value (e.g., '$'). */
  currencySymbol?: string;
  /** An optional callback that also fires on blur, passing the final numeric value. */
  onBlur?: (value: number) => void;
}

/**
 * A controlled input component for currency values that provides an improved user experience.
 * It displays a formatted, read-only style value when blurred and a raw, editable
 * numeric value when focused.
 *
 * @param props The props for the component, including the value and event handlers.
 */
export const CurrencyInput = ({ value, onValueChange, useGrouping = false, currencySymbol = '', onBlur }: CurrencyInputProps): JSX.Element =>  {
    /** Formats a number into a currency string with two decimal places. */
    const formatValue = (val: number | string) => {
        const formatted = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: useGrouping,
        }).format(Number(val) || 0);
        return `${currencySymbol}${formatted}`;
    };

    /** The internal state for what is visibly displayed in the input field. */
    const [displayValue, setDisplayValue] = useState(formatValue(value));
    /** A ref to the input element, used to check if it is currently focused. */
    const inputRef = useRef<HTMLInputElement>(null);

    /**
     * Effect to sync the internal display value with the external `value` prop.
     * This does not run if the user is currently focused on the input, which
     * prevents their typing from being overwritten by parent component re-renders.
     */
    useEffect(() => {
        if (document.activeElement !== inputRef.current) {
            setDisplayValue(formatValue(value));
        }
    }, [value, useGrouping, currencySymbol]);

    /**
     * Handles the onFocus event. Switches the view to the raw numeric value
     * to allow for easy editing.
     */
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        const numValue = parseFloat(value as string);
        setDisplayValue(numValue === 0 ? '' : String(value));
        e.target.select();
    };

    /**
     * Handles the onBlur event. Parses the current input, formats it for display,
     * and propagates the final numeric value to the parent via `onValueChange`.
     */
    const handleBlur = () => {
        const numValue = parseFloat(displayValue);
        const validNum = isNaN(numValue) ? 0.00 : numValue;
        setDisplayValue(formatValue(validNum));
        onValueChange(validNum);
        if (onBlur) {
            onBlur(validNum);
        }
    };

    /**
     * Handles the onChange event. Allows the user to type valid numeric characters,
     * including a single decimal point, for a smooth editing experience.
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value: inputValue } = e.target;
        // Regex to allow numbers and at most one decimal point.
        if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
            setDisplayValue(inputValue);
        }
    };

    return (
        <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="0.00"
            className="currency-input"
        />
    );
};