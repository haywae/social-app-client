import { useState, useRef, useEffect, useMemo, type JSX, type ReactNode } from "react";
import "../common/cDropdown.css" // Uses the same CSS as the country dropdown component
import { type CurrencyItem } from "../../assets/currencies";

/** Props for the CurrencyDropdown component. */
interface CurrencyDropdownProps {
  /** The currently selected CurrencyItem object to display when the dropdown is closed. */
  selectedCurrency: CurrencyItem | undefined;
  /** Callback function invoked with the chosen CurrencyItem when the user makes a selection. */
  onSelect: (currency: CurrencyItem) => void;
  /** The full list of CurrencyItem objects to be displayed and searched within the dropdown. */
  currencies: CurrencyItem[];
}

/** * A helper function that generates the JSX for displaying a currency (flag + ISO code).
 * @param selectedCurrency The currency item to display.
 * @returns A ReactNode to be rendered, or a default "Select" message.
 */
const getDisplayValue = (selectedCurrency: CurrencyItem | undefined): ReactNode => {
  if (!selectedCurrency || !selectedCurrency.iso2) return <span className="select">Select</span>;

  const flagUrl = `https://flagcdn.com/w20/${selectedCurrency.iso2?.toLocaleLowerCase()}.png`;
  return (
    <>
      <img src={flagUrl} alt={`${selectedCurrency.name} flag`} className="flag-img" />
      <span>{selectedCurrency.iso3}</span>
    </>
  );
};

/**
 * A reusable, searchable dropdown component for selecting a currency.
 * It manages its own open/closed state and search functionality.
 *
 * @param props The props for the component, including the current selection, selection handler, and list of options.
 */
const CurrencyDropdown = ({ selectedCurrency, onSelect, currencies }: CurrencyDropdownProps): JSX.Element => {
  /** State to control whether the dropdown list is visible. */
  const [isOpen, setIsOpen] = useState(false);
  /** State to hold the user's input in the search field. */
  const [searchTerm, setSearchTerm] = useState("");
  /** A ref to the main dropdown container, used for detecting outside clicks. */
  const dropdownRef = useRef<HTMLDivElement>(null);

  /** Effect to handle closing the dropdown when the user clicks outside of it. */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    // Add event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);
    // Clean up the event listener when the component unmounts
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /** Memoized list of currencies that match the current search term for improved performance. */
  const filteredCurrencies = useMemo(() => currencies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.iso3.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.countries.some(country => country.toLowerCase().includes(searchTerm))
  ), [currencies, searchTerm]);

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      {/* The selected value display, which also acts as the dropdown toggle button. */}
      <div className="dropdown-selected" onClick={() => setIsOpen(prev => !prev)}>
        {getDisplayValue(selectedCurrency)}
        <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </div>
      {/* The dropdown list, which is rendered conditionally based on the `isOpen` state. */}
      {isOpen && (
        <ul className="dropdown-list">
          {/* Search input field */}
          <input
            type="text"
            className={`dropdown-search`}
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()} // Prevents the dropdown from closing when clicking the search bar
          />
          {/* The scrollable list of selectable currency options. */}
          {filteredCurrencies.map((currency) => (
            <li key={currency.iso3} onClick={() => {
              onSelect(currency);
              setIsOpen(false);
              setSearchTerm("");
            }}>
              {getDisplayValue(currency)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CurrencyDropdown;