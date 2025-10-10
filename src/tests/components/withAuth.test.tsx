import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import withAuth from '../../components/common/withAuth'; // Adjust path
import type { AuthState } from '../../slices/auth/authSlice'; // Adjust path

// ---- Mocks and Test Setup ---- //

// Mock the components that are rendered by the HOC for simplicity.
vi.mock('../../components/loading', () => ({ default: () => <div>Loading...</div> }));
vi.mock('../../pages/authPages/login', () => ({ 
    default: ({ redirectPath }: { redirectPath: string }) => <div>Login Page, redirect to {redirectPath}</div> 
}));

// Create a simple component to be wrapped by the HOC.
const ProtectedComponent = () => <div>Protected Content</div>;

// Create a helper function to render the component with a mocked Redux store.
const renderWithProviders = (ui: React.ReactElement, { preloadedState }: { preloadedState: { auth: AuthState } }) => {
    const store = configureStore({
        reducer: { auth: (state = preloadedState.auth) => state },
        preloadedState,
    });
    return render(<Provider store={store}>{ui}</Provider>);
};

// ---- Test Suite ---- //

describe('withAuth Higher-Order Component', () => {

    it('should render the Login component when not authenticated and not loading', () => {
        // Arrange
        const AuthProtectedComponent = withAuth(ProtectedComponent);
        const preloadedState = {
            auth: {
                isLoading: false,
                isAuthenticated: false,
                username: '', error: null, wasTokenRefreshed: false, tokenError: null
            },
        };
        const initialRoute = '/protected';

        // Act
        renderWithProviders(
            <MemoryRouter initialEntries={[initialRoute]}>
                <AuthProtectedComponent />
            </MemoryRouter>,
            { preloadedState }
        );

        // Assert
        expect(screen.getByText(`Login Page, redirect to ${initialRoute}`)).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render the wrapped Component when authenticated and not loading', () => {
        // Arrange
        const AuthProtectedComponent = withAuth(ProtectedComponent);
        const preloadedState = {
            auth: {
                isLoading: false,
                isAuthenticated: true,
                username: 'TestUser', error: null, wasTokenRefreshed: false, tokenError: null
            },
        };

        // Act
        renderWithProviders(
            <MemoryRouter>
                <AuthProtectedComponent />
            </MemoryRouter>,
            { preloadedState }
        );

        // Assert
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        expect(screen.queryByText(/Login Page/)).not.toBeInTheDocument();
    });
});



