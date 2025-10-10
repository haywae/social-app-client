import { describe, it, expect } from 'vitest';
import authReducer, { resetUserError, type AuthState } from '../../slices/auth/authSlice';
import { loginUser } from '../../thunks/authThunks/loginThunk';
import { logoutUser } from '../../thunks/authThunks/logoutThunk';
import { checkAuth } from '../../thunks/authThunks/authCheckThunk';
import { refreshToken } from '../../thunks/authThunks/refreshTokenThunk';
import type { User } from '../../configs/userTypes';

describe('authSlice', () => {

    const initialState: AuthState = {
    username: "", 
    isAuthenticated: false,
    isLoading: false,
    error: null,
    wasTokenRefreshed: false,
    tokenError: null
};

    const mockUser: User = { id: '1', username: 'TestUser', csrf_access_token: 'csrf_access_token', 
        csrf_refresh_token: 'csrf_refresh_token', access_token_exp: '2023-10-01T00:00:00Z'
    };

    it('should return the initial state on first run', () => {
        // No action passed, should return initial state
        const result = authReducer(undefined, { type: 'unknown' });
        expect(result).toEqual(initialState);
    });

    describe('resetUserError reducer', () => {
        it('should clear the error message', () => {
            const stateWithAnError: AuthState = { ...initialState, error: 'An old error' };
            const result = authReducer(stateWithAnError, resetUserError());
            expect(result.error).toBeNull();
        });
    });

    describe('loginUser extraReducers', () => {
        it('should handle pending state', () => {
            const result = authReducer(initialState, { type: loginUser.pending.type });
            expect(result.isLoading).toBe(true);
            expect(result.error).toBeNull();
        });

        it('should handle fulfilled state', () => {
            const action = { type: loginUser.fulfilled.type, payload: mockUser };
            const result = authReducer(initialState, action);
            expect(result.isAuthenticated).toBe(true);
            expect(result.username).toBe(mockUser.username);
            expect(result.isLoading).toBe(false);
        });

        it('should handle rejected state', () => {
            const action = { type: loginUser.rejected.type, payload: 'Invalid credentials' };
            const result = authReducer(initialState, action);
            expect(result.isAuthenticated).toBe(false);
            expect(result.error).toBe('Invalid credentials');
            expect(result.isLoading).toBe(false);
        });
    });
    
    describe('logoutUser extraReducers', () => {
        const loggedInState: AuthState = { ...initialState, isAuthenticated: true, username: 'TestUser' };

        it('should handle fulfilled state', () => {
            const action = { type: logoutUser.fulfilled.type };
            const result = authReducer(loggedInState, action);
            expect(result).toEqual(initialState); // Should reset to initial state
        });
    });

    describe('checkAuth extraReducers', () => {
        it('should handle fulfilled state', () => {
            const action = { type: checkAuth.fulfilled.type, payload: mockUser };
            const result = authReducer(initialState, action);
            expect(result.isAuthenticated).toBe(true);
            expect(result.username).toBe(mockUser.username);
            expect(result.isLoading).toBe(false);
        });

        it('should handle rejected state for an expired access token', () => {
            // This is the critical test for the auto-refresh logic
            const action = { type: checkAuth.rejected.type, payload: 'access_token_expired' };
            const result = authReducer(initialState, action);
            expect(result.isAuthenticated).toBe(false);
            expect(result.tokenError).toBe(null); // This should be set
            expect(result.error).toBeNull(); // General error should NOT be set
            expect(result.isLoading).toBe(false);
        });

        it('should handle rejected state for other invalid tokens', () => {
            const action = { type: checkAuth.rejected.type, payload: 'invalid_token' };
            const result = authReducer(initialState, action);
            expect(result.isAuthenticated).toBe(false);
            expect(result.tokenError).toBeNull(); // Token error should NOT be set
            expect(result.error).toBe(null); // General error SHOULD be set
            expect(result.isLoading).toBe(false);
        });
    });

    describe('refreshToken extraReducers', () => {
        it('should handle fulfilled state', () => {
            const action = { type: refreshToken.fulfilled.type };
            const result = authReducer(initialState, action);
            expect(result.wasTokenRefreshed).toBe(true);
            expect(result.isLoading).toBe(false);
        });

        it('should handle rejected state for an expired refresh token', () => {
            const action = { type: refreshToken.rejected.type, payload: 'refresh_token_expired' };
            const result = authReducer(initialState, action);
            expect(result.isAuthenticated).toBe(false);
            expect(result.username).toBe('');
            expect(result.error).toBe('Please log in again.');
            expect(result.isLoading).toBe(false);
        });
    });
});
