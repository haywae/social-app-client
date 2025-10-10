import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { calculateConversion } from '../../utils/exchangeUtils';

// The component to test
import Converter from '../../components/exchange/converter';
import { type ConversionRow, type Rate } from '../../components/exchange/converter';

// Mock child components and utility functions
vi.mock('../../components/exchange/currencyDropdown', () => ({
    default: ({ selectedCurrency, onSelect, 'data-testid': testId }: any) => (
        <button data-testid={testId} onClick={() => onSelect({ iso3: 'JPY', name: 'Yen', symbol: '¥' })}>
            {selectedCurrency?.iso3 || 'Select'}
        </button>
    ),
}));

vi.mock('../../components/exchange/currencyInput', () => ({
    CurrencyInput: ({ value, onValueChange, currencySymbol, 'data-testid': testId }: any) => (
        <div data-testid={testId}>
            <span>{currencySymbol}</span>
            <input
                type="number"
                value={value}
                onChange={(e) => onValueChange(Number(e.target.value))}
            />
        </div>
    ),
}));

vi.mock('../../utils/exchangeUtils', () => ({
    calculateConversion: vi.fn((row) => ({ ...row, calculated: true })), // Mock implementation
}));

// Mock icons
vi.mock('../../assets/icons', () => ({
    RightArrowIcon: () => <div data-testid="right-arrow-icon">-&gt;</div>,
    CopyIcon: ({ onClick }: { onClick: () => void }) => <button data-testid="copy-icon" onClick={onClick}>Copy</button>,
    CloseIcon: ({ onClick }: { onClick: () => void }) => <button data-testid="close-icon" onClick={onClick}>X</button>,
    RefreshIcon: ({ onClick }: { onClick: () => void }) => <button data-testid="refresh-icon" onClick={onClick}>Reset</button>,
}));

// Mock clipboard API
Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
    },
});


describe('Converter Component', () => {
    // --- Mocks & Test Data ---
    const mockedCalculateConversion = vi.mocked(calculateConversion);
    const mockSetRows = vi.fn();

    const mockRates: Rate[] = [
        { currency: 'USD', buy: 1.0, sell: 1.0 },
        { currency: 'EUR', buy: 0.9, sell: 0.92 },
    ];

    const mockAvailableCurrencies = [
        { iso2:'US', iso3: 'USD', name: 'US Dollar', countries:["US"], symbol: '$' },
        { iso2:'EU', iso3: 'EUR', name: 'Euro', countries:["US"], symbol: '€' },
        { iso2:'JP', iso3: 'JPY', name: 'Yen', countries:["US"], symbol: '¥' },
    ];

    const initialRows: ConversionRow[] = [
        { fromCurrency: 'USD', toCurrency: 'EUR', fromValue: 100, toValue: 92 },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // --- Helper Function ---
    const renderComponent = (mode: 'convert' | 'findOut', rows: ConversionRow[]) => {
        render(
            <Converter
                rates={mockRates}
                mode={mode}
                rows={rows}
                setRows={mockSetRows}
                availableCurrencies={mockAvailableCurrencies}
            />
        );
    };

    // --- Tests ---
    it('should render correctly in "convert" mode', () => {
        renderComponent('convert', initialRows);

        // Check for titles
        expect(screen.getByText('From')).toBeInTheDocument();
        expect(screen.getByText('To')).toBeInTheDocument();

        // In 'convert' mode, find the input by its role.
        expect(screen.getByRole('spinbutton')).toHaveValue(100);
        // Find the output by its text content.
        expect(screen.getByText('€92.00')).toBeInTheDocument();
    });
    
    it('should render correctly in "findOut" mode', () => {
        renderComponent('findOut', initialRows);

        // In 'findOut' mode, find the output by text and input by role.
        expect(screen.getByText('$100.00')).toBeInTheDocument();
        expect(screen.getByRole('spinbutton')).toHaveValue(92);
    });

    it('should handle value change in "convert" mode', () => {
        renderComponent('convert', initialRows);

        // Find the input by its accessible role
        const fromInput = screen.getByRole('spinbutton');
        fireEvent.change(fromInput, { target: { value: '200' } });

        expect(mockedCalculateConversion).toHaveBeenCalledWith(
            expect.objectContaining({ fromValue: 200 }),
            'convert',
            mockRates
        );
        expect(mockSetRows).toHaveBeenCalled();
    });

    it('should handle currency change', () => {
        renderComponent('convert', initialRows);

        // Find the dropdown button by its visible text
        const fromDropdown = screen.getByRole('button', { name: 'USD' });
        fireEvent.click(fromDropdown);

        expect(mockedCalculateConversion).toHaveBeenCalledWith(
            expect.objectContaining({ fromCurrency: 'JPY' }), // JPY is the currency from the mock
            'convert',
            mockRates
        );
        expect(mockSetRows).toHaveBeenCalled();
    });

    it('should reset a row when refresh icon is clicked', () => {
        renderComponent('convert', initialRows);

        const refreshButton = screen.getByTestId('refresh-icon');
        fireEvent.click(refreshButton);

        expect(mockedCalculateConversion).toHaveBeenCalledWith(
            expect.objectContaining({ fromValue: 0 }), // Resets fromValue in 'convert' mode
            'convert',
            mockRates
        );
        expect(mockSetRows).toHaveBeenCalled();
    });

    it('should remove a row when close icon is clicked', () => {
        const twoRows: ConversionRow[] = [
            { fromCurrency: 'USD', toCurrency: 'EUR', fromValue: 100, toValue: 92 },
            { fromCurrency: 'EUR', toCurrency: 'USD', fromValue: 50, toValue: 55 },
        ];
        renderComponent('convert', twoRows);

        const closeButtons = screen.getAllByTestId('close-icon');
        expect(closeButtons).toHaveLength(1); // Only on the second row
        fireEvent.click(closeButtons[0]);

        expect(mockSetRows).toHaveBeenCalledWith([twoRows[0]]); // Should be called with only the first row remaining
    });

    it('should not render close icon for the first row', () => {
        renderComponent('convert', initialRows);
        expect(screen.queryByTestId('close-icon')).not.toBeInTheDocument();
    });

    it('should copy value to clipboard', () => {
        renderComponent('convert', initialRows);

        const copyButton = screen.getByTestId('copy-icon');
        fireEvent.click(copyButton);

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('92');
    });
});

