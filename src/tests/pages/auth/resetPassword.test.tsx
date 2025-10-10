import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// The component to test
import ResetPassword from '../../../pages/authPages/resetPassword';

// Import modules to be mocked
import { useAppSelector, useAppDispatch } from '../../../utils/hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../../thunks/userThunks/resetPasswordThunk';
import { clearError } from '../../../slices/user/passwordResetSlice';
import type { ResetPasswordCredentials } from '../../../configs/userTypes';

// --- Mocks ---
vi.mock('../../../utils/hooks');
vi.mock('../../../thunks/userThunks/resetPasswordThunk');
vi.mock('../../../slices/user/passwordResetSlice');

// This is the corrected mock using the async factory pattern.
// It reliably preserves original exports like <MemoryRouter> while allowing us to mock hooks.
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual, // Import and spread all original exports
        useLocation: vi.fn(), // Override useLocation with a mock
        useNavigate: vi.fn(), // Override useNavigate with a mock
    };
});


// --- Type-Safe Mock References ---
const mockedUseAppDispatch = useAppDispatch as Mock;
const mockedUseAppSelector = useAppSelector as Mock;
const mockedUseLocation = useLocation as Mock;
const mockedUseNavigate = useNavigate as Mock;
const mockedResetPassword = resetPassword as unknown as Mock;
const mockedClearError = clearError as unknown as Mock;


describe('ResetPassword Component', () => {
    const mockDispatch = vi.fn();
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock implementations
        mockedUseAppDispatch.mockReturnValue(mockDispatch);
        mockedUseAppSelector.mockReturnValue({
            isPasswordReset: false,
            error: null,
            loading: false,
        });
        mockedUseNavigate.mockReturnValue(mockNavigate);
        // Default location mock for a happy path (with a token)
        mockedUseLocation.mockReturnValue({
            search: '?token=test-token-12345',
        });

        // Mock the return of dispatching the thunk, including the .unwrap() method
        mockDispatch.mockReturnValue({
            unwrap: vi.fn().mockResolvedValue({ message: 'Password reset successful.' })
        });
        
        // Ensure action creators return plain objects
        mockedClearError.mockReturnValue({ type: 'passwordReset/clearError' });
        mockedResetPassword.mockImplementation((credentials: ResetPasswordCredentials) => ({
            type: 'passwordReset/reset/pending',
            payload: credentials,
        }));
    });

    const renderComponent = () => {
        render(
            <MemoryRouter initialEntries={['/reset-password?token=test-token-12345']}>
                <Routes>
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );
    };

    it('should render the form correctly', () => {
        renderComponent();
        expect(screen.getByRole('heading', { name: /Reset Password/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/^New Password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
    });

    it('should show validation error if fields are empty on submit', async () => {
        renderComponent();
        fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));
        expect(await screen.findByText('Please fill in all fields.')).toBeInTheDocument();
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should show validation error if passwords do not match', async () => {
        renderComponent();
        fireEvent.change(screen.getByLabelText(/^New Password$/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'password456' } });
        fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

        expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should show validation error if no token is in the URL', async () => {
        mockedUseLocation.mockReturnValue({ search: '' }); // Override location mock for this test
        renderComponent();

        fireEvent.change(screen.getByLabelText(/^New Password$/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

        expect(await screen.findByText('Invalid password reset link. No token found.')).toBeInTheDocument();
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should dispatch resetPassword on successful submission', async () => {
        renderComponent();
        fireEvent.change(screen.getByLabelText(/^New Password$/i), { target: { value: 'newSecurePassword!' } });
        fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'newSecurePassword!' } });
        fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith(
                mockedResetPassword({
                    token: 'test-token-12345',
                    newPassword: 'newSecurePassword!',
                })
            );
        });
    });

    it('should navigate to /login when isPasswordReset becomes true', () => {
        mockedUseAppSelector.mockReturnValue({
            isPasswordReset: true,
            error: null,
            loading: false,
        });
        renderComponent();

        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should display a loading state on the button', () => {
        mockedUseAppSelector.mockReturnValue({
            isPasswordReset: false,
            error: null,
            loading: true,
        });
        renderComponent();
        const button = screen.getByRole('button', { name: /Resetting Password.../i });
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
    });
    
    it('should display an error from the Redux store', async () => {
        mockedUseAppSelector.mockReturnValue({
            isPasswordReset: false,
            error: 'Invalid or expired token.',
            loading: false,
        });
        renderComponent();
        expect(await screen.findByText('Invalid or expired token.')).toBeInTheDocument();
    });
});
