import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// The component to test
import ForgotPassword from '../../../pages/authPages/forgotPassword';

// Import modules to be mocked
import { useAppSelector, useAppDispatch } from '../../../utils/hooks';
import { requestPasswordReset } from '../../../thunks/userThunks/requestPasswordResetThunk';
import { clearError } from '../../../slices/user/passwordResetSlice';

// --- Mocks ---
// Mock all external dependencies
vi.mock('../../../utils/hooks');
vi.mock('../../../thunks/userThunks/requestPasswordResetThunk', () => ({
    requestPasswordReset: vi.fn(),
    })
);
vi.mock('../../../slices/user/passwordResetSlice');


// --- Type-Safe Mock References ---
// Cast the mocked imports to the `Mock` type for type safety
const mockedUseAppDispatch = useAppDispatch as Mock;
const mockedUseAppSelector = useAppSelector as Mock;
const mockedRequestPasswordReset = requestPasswordReset as unknown as Mock;
const mockedClearError = clearError as unknown as Mock;


describe('ForgotPassword Component', () => {
    // This represents the dispatch function returned by the useAppDispatch hook
    const mockDispatch = vi.fn();

    // beforeEach runs before each test, ensuring a clean state
    beforeEach(() => {
        vi.clearAllMocks();

        // Set default mock implementations for the hooks
        mockedUseAppDispatch.mockReturnValue(mockDispatch);
        mockedUseAppSelector.mockReturnValue({
            isEmailSent: false,
            error: null,
            loading: false,
        });

        // Mock the return of dispatching the thunk, including the .unwrap() method
        mockDispatch.mockReturnValueOnce({
            unwrap: vi.fn().mockResolvedValue({ message: 'Success' })
        });
        
        // Ensure our mocked action creators return a plain object
        mockedClearError.mockReturnValue(null);
    });

    // Helper to render the component within a router
    const renderComponent = () => {
        render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );
    };

    it('should render the initial form correctly', () => {
        renderComponent();
        expect(screen.getByRole('heading', { name: /Forgot Password/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Enter your email address/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Back to Login/i })).toBeInTheDocument();
    });

    it('should allow a user to type in the email field', () => {
        renderComponent();
        const emailInput = screen.getByLabelText<HTMLInputElement>(/Enter your email address/i);
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        expect(emailInput.value).toBe('test@example.com');
    });

    it('should show a validation error if submitted with an empty email', async () => {
        renderComponent();
        const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
        fireEvent.click(submitButton);

        expect(await screen.findByText('Please enter your email address.')).toBeInTheDocument();
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should dispatch requestPasswordReset and show success message on successful submission', async () => {
        renderComponent();
        
        const emailInput = screen.getByLabelText(/Enter your email address/i);
        const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });

        fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith(mockedRequestPasswordReset('user@example.com'));
        });
        
        // To test the success message, we need to re-render with the updated state from the mock selector
        mockedUseAppSelector.mockReturnValue({
            isEmailSent: true,
            error: null,
            loading: false,
        });
        renderComponent(); // Re-render the component

        expect(await screen.findByText(/An email with password reset instructions has been sent/i)).toBeInTheDocument();
        expect(screen.queryByRole('form')).not.toBeInTheDocument(); // The form should be gone
    });

    it('should show a loading state on the button during submission', () => {
        mockedUseAppSelector.mockReturnValue({
            isEmailSent: false,
            error: null,
            loading: true,
        });
        renderComponent();

        const submitButton = screen.getByRole('button', { name: /Sending link.../i });
        expect(submitButton).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
    });

    it('should display an error message from the Redux store', () => {
        const errorMessage = 'User not found.';
        mockedUseAppSelector.mockReturnValue({
            isEmailSent: false,
            error: errorMessage,
            loading: false,
        });
        renderComponent();

        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should dispatch clearError when typing if an error exists', () => {
        mockedUseAppSelector.mockReturnValue({
            isEmailSent: false,
            error: 'An existing error',
            loading: false,
        });
        renderComponent();

        const emailInput = screen.getByLabelText(/Enter your email address/i);
        fireEvent.change(emailInput, { target: { value: 'a' } });

        expect(mockDispatch).toHaveBeenCalledWith(mockedClearError());
    });
});
