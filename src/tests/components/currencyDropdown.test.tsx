import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// The component to test
import CurrencyDropdown from '../../components/exchange/currencyDropdown';
import { type CurrencyItem } from '../../assets/currencies';

describe('CurrencyDropdown Component', () => {
    // --- Mocks & Test Data ---
    const mockOnSelect = vi.fn();

    const mockCurrencies: CurrencyItem[] = [
        { iso2: 'US', iso3: 'USD', name: 'US Dollar', symbol: '$', countries: ['United States'] },
        { iso2: 'EU', iso3: 'EUR', name: 'Euro', symbol: '€', countries: ['Germany', 'France'] },
        { iso2: 'JP', iso3: 'JPY', name: 'Japanese Yen', symbol: '¥', countries: ['Japan'] },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // --- Tests ---
    it('should render with "Select" when no currency is selected', () => {
        render(
            <CurrencyDropdown
                selectedCurrency={undefined}
                onSelect={mockOnSelect}
                currencies={mockCurrencies}
            />
        );
        expect(screen.getByText('Select')).toBeInTheDocument();
    });

    it('should render the selected currency with its flag and ISO3 code', () => {
        render(
            <CurrencyDropdown
                selectedCurrency={mockCurrencies[0]}
                onSelect={mockOnSelect}
                currencies={mockCurrencies}
            />
        );
        expect(screen.getByText('USD')).toBeInTheDocument();
        const flagImage = screen.getByAltText('US Dollar flag');
        expect(flagImage).toBeInTheDocument();
        expect(flagImage).toHaveAttribute('src', 'https://flagcdn.com/w20/us.png');
    });

    it('should open the dropdown list when clicked', () => {
        render(
            <CurrencyDropdown
                selectedCurrency={mockCurrencies[0]}
                onSelect={mockOnSelect}
                currencies={mockCurrencies}
            />
        );
        const dropdownHeader = screen.getByText('USD');
        fireEvent.click(dropdownHeader);

        // Check if the search input and list are visible
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
        expect(screen.getByText('JPY')).toBeInTheDocument(); // Check for an item in the list
    });

    it('should close the dropdown when clicking outside', () => {
        render(
            <div>
                <CurrencyDropdown
                    selectedCurrency={mockCurrencies[0]}
                    onSelect={mockOnSelect}
                    currencies={mockCurrencies}
                />
                <div data-testid="outside-element">Click me</div>
            </div>
        );
        // Open the dropdown first
        fireEvent.click(screen.getByText('USD'));
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();

        // Click outside the dropdown
        fireEvent.mouseDown(screen.getByTestId('outside-element'));

        // Assert that the dropdown is now closed
        expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
    });

    it('should filter currencies based on search term (by name)', () => {
        render(
            <CurrencyDropdown
                selectedCurrency={undefined}
                onSelect={mockOnSelect}
                currencies={mockCurrencies}
            />
        );
        fireEvent.click(screen.getByText('Select')); // Open dropdown

        const searchInput = screen.getByPlaceholderText('Search...');
        fireEvent.change(searchInput, { target: { value: 'Yen' } });

        // Only Japanese Yen should be visible
        expect(screen.getByText('JPY')).toBeInTheDocument();
        expect(screen.queryByText('US Dollar')).not.toBeInTheDocument();
        expect(screen.queryByText('Euro')).not.toBeInTheDocument();
    });

    it('should filter currencies based on search term (by ISO3 code)', () => {
        render(
            <CurrencyDropdown
                selectedCurrency={undefined}
                onSelect={mockOnSelect}
                currencies={mockCurrencies}
            />
        );
        fireEvent.click(screen.getByText('Select'));

        const searchInput = screen.getByPlaceholderText('Search...');
        fireEvent.change(searchInput, { target: { value: 'eur' } }); // Case-insensitive search

        expect(screen.getByText('EUR')).toBeInTheDocument();
        expect(screen.queryByText('US Dollar')).not.toBeInTheDocument();
    });

    it('should call onSelect and close the dropdown when a currency is chosen', () => {
        render(
            <CurrencyDropdown
                selectedCurrency={undefined}
                onSelect={mockOnSelect}
                currencies={mockCurrencies}
            />
        );
        fireEvent.click(screen.getByText('Select')); // Open dropdown

        // Click on the 'Euro' option
        fireEvent.click(screen.getByText('EUR'));

        // Assert that onSelect was called with the correct currency object
        expect(mockOnSelect).toHaveBeenCalledWith(mockCurrencies[1]);

        // Assert that the dropdown is now closed
        expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
    });
});
