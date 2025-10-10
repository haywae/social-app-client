import { useState, useMemo, type JSX, type ReactNode } from "react";
import {
  useFloating,
  useClick,
  useDismiss,
  useInteractions,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  size,
} from "@floating-ui/react";
import "./cDropdown.css";
import { allCountries, type CountryItem } from "../../assets/countries";

interface CountryDropdownProps {
  selectedCountry: CountryItem | undefined;
  onSelect: (country: CountryItem) => void;
}

const CountryDropdown = ({ selectedCountry, onSelect }: CountryDropdownProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Floating UI Hook Setup ---
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(5), // Add 5px space between button and menu
      size({ // Ensure the menu has the same width as the button
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
      }),
    ],
    placement: 'bottom-start',
  });

  // --- Interaction Hooks ---
  const click = useClick(context);
  const dismiss = useDismiss(context);
  // Merge the interaction hooks into props
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  // --- Data Filtering ---
  const filteredCountries = useMemo(() =>
    allCountries.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.currencyCode.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm]);

  const getDisplayValue = (country: CountryItem | undefined): ReactNode => {
    if (!country) return <span>-- Select --</span>;
    const flagUrl = `https://flagcdn.com/w20/${country.iso2?.toLowerCase()}.png`;
    return (
      <>
        <img src={flagUrl} alt={`${country.name} flag`} />
        <span>{country.name}</span>
      </>
    );
  };

  const handleSelect = (country: CountryItem) => {
    onSelect(country);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="custom-dropdown">
      {/* This is the trigger button */}
      <div
        className="dropdown-selected"
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        {getDisplayValue(selectedCountry)}
        <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </div>

      {/* This is the portaled dropdown menu */}
      <FloatingPortal>
        {isOpen && (
          <FloatingFocusManager context={context} modal={false}>
            <div
              className="dropdown-portal-menu"
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
            >
              <input
                type="text"
                className="dropdown-search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <ul className="dropdown-list">
                {filteredCountries.map((country) => (
                  <li key={country.iso2} onClick={() => handleSelect(country)}>
                    {getDisplayValue(country)}
                  </li>
                ))}
              </ul>
            </div>
          </FloatingFocusManager>
        )}
      </FloatingPortal>
    </div>
  );
};

export default CountryDropdown;