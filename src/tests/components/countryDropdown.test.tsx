/// <reference types="vitest/globals" />

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CountryDropdown from '../../components/common/countryDropdown';
import { allCountries, type CountryItem } from '../../assets/countries'; 


// --- Mocks ---

// Mock the countries data module to provide a controlled test environment
vi.mock('../../assets/countries', () => ({
    allCountries: [
        { name: 'Nigeria', iso2: 'NG', currencyCode: 'NGN', iso3: 'NGA', currencySymbol: '₦' },
        { name: 'United States', iso2: 'US', currencyCode: 'USD', iso3: 'USA', currencySymbol: '$' },
        { name: 'Canada', iso2: 'CA', currencyCode: 'CAD', iso3: 'CAN', currencySymbol: '$' },
    ]
}));

describe('CountryDropdown Component', () => {
    // Mock data to be used in tests
    const mockCountries: CountryItem[] = allCountries;
    const mockOnSelect = vi.fn();

    beforeEach(() => {
        // Reset mocks before each test to ensure a clean state
        vi.clearAllMocks();
    });

    // Test 1: Initial Rendering without a selection
    it('should render the placeholder when no country is selected', () => {
        render(<CountryDropdown selectedCountry={undefined} onSelect={mockOnSelect} />);
        
        expect(screen.getByText(/-- Select --/i)).toBeInTheDocument();
        // The dropdown list should be closed by default
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    // Test 2: Initial Rendering with a selected country
    it('should render the selected country with its flag and name', () => {
        const selected = mockCountries[0]; // Nigeria
        render(<CountryDropdown selectedCountry={selected} onSelect={mockOnSelect} />);
        
        expect(screen.getByText('Nigeria')).toBeInTheDocument();
        const flagImage = screen.getByRole('img') as HTMLImageElement;
        expect(flagImage).toBeInTheDocument();
        expect(flagImage.alt).toBe('Nigeria flag');
        expect(flagImage.src).toContain('https://flagcdn.com/w20/ng.png');
    });

    // Test 3: Toggling the dropdown open and closed
    it('should toggle the dropdown list visibility on click', async () => {
        const user = userEvent.setup();
        render(<CountryDropdown selectedCountry={undefined} onSelect={mockOnSelect} />);

        const dropdownHeader = screen.getByText(/-- Select --/i);
        
        // Initially, the list is not visible
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
        
        // Click to open
        await user.click(dropdownHeader);
        expect(screen.getByRole('list')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();

        // Click again to close
        await user.click(dropdownHeader);
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    // Test 4: Filtering the list by typing in the search box
    it('should filter the list of countries based on search term', async () => {
        const user = userEvent.setup();
        render(<CountryDropdown selectedCountry={undefined} onSelect={mockOnSelect} />);
        
        // Open the dropdown
        await user.click(screen.getByText(/-- Select --/i));
        
        const searchInput = screen.getByPlaceholderText('Search...');
        
        // Initially shows all 3 countries
        expect(screen.getAllByRole('listitem')).toHaveLength(3);

        // Type a search term
        await user.type(searchInput, 'United');

        // Should now only show 'United States'
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(1);
        expect(listItems[0]).toHaveTextContent('United States');
    });

    // Test 5: Selecting a country from the list
    it('should call onSelect with the correct country and close the dropdown when an item is clicked', async () => {
        const user = userEvent.setup();
        render(<CountryDropdown selectedCountry={undefined} onSelect={mockOnSelect} />);
        
        // Open the dropdown
        await user.click(screen.getByText(/-- Select --/i));

        // Click on 'Canada'
        const canadaOption = screen.getByText('Canada');
        await user.click(canadaOption);

        // Check if onSelect was called correctly
        expect(mockOnSelect).toHaveBeenCalledTimes(1);
        expect(mockOnSelect).toHaveBeenCalledWith(mockCountries[2]); // mockCountries[2] is Canada

        // Check if the dropdown closed after selection
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    // Test 6: Closing the dropdown by clicking outside
    it('should close the dropdown when clicking outside the component', async () => {
        const user = userEvent.setup();
        render(
            <div>
                <CountryDropdown selectedCountry={undefined} onSelect={mockOnSelect} />
                <div data-testid="outside">Outside Element</div>
            </div>
        );

        // Open the dropdown
        await user.click(screen.getByText(/-- Select --/i));
        expect(screen.getByRole('list')).toBeInTheDocument();

        // Click the outside element
        await user.click(screen.getByTestId('outside'));
        
        // The dropdown should now be closed
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
});

