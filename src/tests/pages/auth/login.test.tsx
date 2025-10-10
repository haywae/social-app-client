/// <reference types="vitest/globals" />

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // Import user-event
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from '../../../pages/authPages/login';
import { resetUserError } from '../../../slices/auth/authSlice';
import { loginUser } from '../../../thunks/authThunks/loginThunk';
import { useAppSelector, useAppDispatch } from '../../../utils/hooks';

// Mocks
vi.mock('../../../slices/auth/authSlice');
vi.mock('../../../utils/hooks', () => ({
    useAppSelector: vi.fn(),
    useAppDispatch: vi.fn(),
}));
vi.mock('../../../thunks/authThunks/loginThunk', () => ({
    loginUser: vi.fn(),
}));

const mockedResetUserError = resetUserError as unknown as Mock;
const mockedLoginUser = loginUser as unknown as Mock;
const mockedUseAppSelector = useAppSelector as Mock;
const mockedUseAppDispatch = useAppDispatch as Mock;

describe('Login Component', () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Set a default return value for the selector for most tests
        mockedUseAppSelector.mockReturnValue({
            isLoading: false,
            error: null,
            isAuthenticated: false,
        });
        mockedUseAppDispatch.mockReturnValue(mockDispatch);
    });

    const renderComponent = (redirectPath?: string) => {
        return render(
            <MemoryRouter initialEntries={['/login']}>
                <Routes>
                    <Route path="/login" element={<Login redirectPath={redirectPath} />} />
                    <Route path="/home" element={<div>Home Page</div>} />
                    <Route path="/custom-path" element={<div>Custom Redirect Page</div>} />
                </Routes>
            </MemoryRouter>
        );
    };

    it('should render the login form correctly', () => {
        renderComponent();
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByLabelText(/Username\/Email/i)).toBeInTheDocument();
    });

    it('should allow user to type into username/email and password fields', async () => {
        const user = userEvent.setup();
        renderComponent();

        const identifierInput = screen.getByLabelText<HTMLInputElement>(/Username\/Email/i);
        const passwordInput = screen.getByLabelText<HTMLInputElement>(/Password/i);

        await user.type(identifierInput, 'testuser@example.com');
        await user.type(passwordInput, 'password123');

        expect(identifierInput.value).toBe('testuser@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    it('should show a validation error if form is submitted with empty fields', async () => {
        const user = userEvent.setup();
        renderComponent();
        await user.click(screen.getByRole('button', { name: /Log in/i }));

        expect(await screen.findByText('Please enter both username/email and password.')).toBeInTheDocument();
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should dispatch loginUser action and redirect to Home on successful login', async () => {
        const user = userEvent.setup();
        const { rerender } = renderComponent('/home');

        mockedLoginUser.mockReturnValue({
            type: 'auth/login/fulfilled',
            payload: { user: 'testuser' },
        });

        await user.type(screen.getByLabelText(/Username\/Email/i), 'testuser');
        await user.type(screen.getByLabelText(/Password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /Log in/i }));
        
        // Wait for the action to be dispatched
        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith(mockedLoginUser.mock.results[0].value);
        });

        // Simulate state update and rerender
        mockedUseAppSelector.mockReturnValue({
            isLoading: false,
            error: null,
            isAuthenticated: true,
        });

        rerender(
            <MemoryRouter initialEntries={['/login']}>
                <Routes>
                    <Route path="/login" element={<Login redirectPath={'/home'} />} />
                    <Route path="/home" element={<div>Home Page</div>} />
                </Routes>
            </MemoryRouter>
        );
        
        // Assert the final result
        expect(await screen.findByText('Home Page')).toBeInTheDocument();
    });

    it('should display loading state on the button during form submission', () => {
        mockedUseAppSelector.mockReturnValue({
            isLoading: true,
            error: null,
            isAuthenticated: false,
        });
        
        renderComponent();
        const submitButton = screen.getByRole('button', { name: /Logging in.../i });
        expect(submitButton).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
    });

    it('should display an error message from the store on render', async () => {
        const errorMessage = 'Invalid credentials from a previous attempt.';
        mockedUseAppSelector.mockReturnValue({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
        });

        renderComponent();
        expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    });
    
    it('should clear password field on rejected login attempt', async () => {
        const user = userEvent.setup();
        mockDispatch.mockRejectedValue(new Error('Login Failed'));
        
        renderComponent();
        const passwordInput = screen.getByLabelText<HTMLInputElement>(/Password/i);

        await user.type(screen.getByLabelText(/Username\/Email/i), 'wronguser');
        await user.type(passwordInput, 'wrongpassword');
        await user.click(screen.getByRole('button', { name: /Log in/i }));

        await waitFor(() => {
            expect(passwordInput.value).toBe('');
        });
    });

    it('should dispatch resetUserError when input changes and an error exists', async () => {
        const user = userEvent.setup();
        mockedUseAppSelector.mockReturnValue({
            isLoading: false,
            error: 'An error occurred',
            isAuthenticated: false,
        });

        renderComponent();
        expect(screen.getByText('An error occurred')).toBeInTheDocument();

        await user.type(screen.getByLabelText(/Username\/Email/i), 'a');

        expect(mockDispatch).toHaveBeenCalledWith(mockedResetUserError());
    }); 
});