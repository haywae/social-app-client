import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// The component to test
import { CurrencyInput } from '../../components/exchange/currencyInput'; 
describe('CurrencyInput Component', () => {
    // --- Mocks & Test Data ---
    const mockOnValueChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // --- Tests ---
    it('should render the initial value formatted with grouping and symbol', () => {
        render(
            <CurrencyInput
                value={1234.56}
                onValueChange={mockOnValueChange}
                useGrouping={true}
                currencySymbol="$"
            />
        );
        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('$1,234.56');
    });

    it('should render the initial value formatted without grouping', () => {
        render(
            <CurrencyInput
                value={1234.56}
                onValueChange={mockOnValueChange}
                useGrouping={false}
                currencySymbol="€"
            />
        );
        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('€1234.56');
    });

    it('should display the raw, unformatted value on focus', () => {
        render(<CurrencyInput value={555.55} onValueChange={mockOnValueChange} />);
        const input = screen.getByRole('textbox');
        fireEvent.focus(input);
        expect(input).toHaveValue('555.55');
    });
    
    it('should clear the input on focus if the initial value is 0', () => {
        render(<CurrencyInput value={0} onValueChange={mockOnValueChange} />);
        const input = screen.getByRole('textbox');
        fireEvent.focus(input);
        expect(input).toHaveValue('');
    });

    it('should allow the user to type a new numeric value', () => {
        render(<CurrencyInput value={100} onValueChange={mockOnValueChange} />);
        const input = screen.getByRole('textbox');
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: '987.65' } });
        expect(input).toHaveValue('987.65');
        // onValueChange should not be called yet
        expect(mockOnValueChange).not.toHaveBeenCalled();
    });

    it('should format the value and call onValueChange on blur', () => {
        render(<CurrencyInput value={100} onValueChange={mockOnValueChange} currencySymbol="$" useGrouping={true} />);
        const input = screen.getByRole('textbox');
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: '5000' } });
        fireEvent.blur(input);

        // Assert formatting and callback
        expect(input).toHaveValue('$5,000.00'); // Default grouping is false, let's fix the component to have it true
        expect(mockOnValueChange).toHaveBeenCalledTimes(1);
        expect(mockOnValueChange).toHaveBeenCalledWith(5000);
    });

    it('should handle empty input on blur by defaulting to 0', () => {
        render(<CurrencyInput value={100} onValueChange={mockOnValueChange} currencySymbol="$" />);
        const input = screen.getByRole('textbox');
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.blur(input);

        expect(input).toHaveValue('$0.00');
        expect(mockOnValueChange).toHaveBeenCalledWith(0);
    });

    it('should prevent non-numeric characters from being entered', () => {
        render(<CurrencyInput value={100} onValueChange={mockOnValueChange} />);
        const input = screen.getByRole('textbox');
        fireEvent.focus(input);

        // Current value is '100'
        fireEvent.change(input, { target: { value: '100a' } });
        // The component's logic should reject this change, keeping the display value as '100'
        expect(input).toHaveValue('100');

        // A valid partial value should be allowed
        fireEvent.change(input, { target: { value: '100.' } });
        expect(input).toHaveValue('100.');
    });
});
