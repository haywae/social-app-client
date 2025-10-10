import { describe, it, expect } from 'vitest';
import passwordResetReducer, { resetPasswordResetState, clearError } from '../../slices/user/passwordResetSlice'; 
import { requestPasswordReset } from '../../thunks/userThunks/requestPasswordResetThunk';
import { resetPassword } from '../../thunks/userThunks/resetPasswordThunk';
import type { PasswordResetState } from '../../slices/user/passwordResetSlice'; 

describe('passwordResetSlice', () => {
    // The initial state for reference
    const initialState: PasswordResetState = {
        isEmailSent: false,
        isPasswordReset: false,
        loading: false,
        error: null,
    };

    it('should return the initial state on first run', () => {
        const result = passwordResetReducer(undefined, { type: 'unknown' });
        expect(result).toEqual(initialState);
    });

    describe('reducers', () => {
        it('should handle resetPasswordResetState', () => {
            const currentState: PasswordResetState = {
                isEmailSent: true,
                isPasswordReset: true,
                loading: true,
                error: 'An old error',
            };
            const result = passwordResetReducer(currentState, resetPasswordResetState());
            expect(result).toEqual(initialState);
        });

        it('should handle clearError', () => {
            const currentState: PasswordResetState = { ...initialState, error: 'An error to clear' };
            const result = passwordResetReducer(currentState, clearError());
            expect(result.error).toBeNull();
        });
    });

    describe('requestPasswordReset extraReducers', () => {
        it('should handle pending state', () => {
            const action = { type: requestPasswordReset.pending.type };
            const result = passwordResetReducer(initialState, action);
            expect(result.loading).toBe(true);
            expect(result.error).toBeNull();
        });

        it('should handle fulfilled state', () => {
            const action = { type: requestPasswordReset.fulfilled.type };
            const result = passwordResetReducer(initialState, action);
            expect(result.loading).toBe(false);
            expect(result.isEmailSent).toBe(true);
            expect(result.error).toBeNull();
        });

        it('should handle rejected state', () => {
            const errorMessage = 'Email not found';
            const action = { type: requestPasswordReset.rejected.type, payload: errorMessage };
            const result = passwordResetReducer(initialState, action);
            expect(result.loading).toBe(false);
            expect(result.isEmailSent).toBe(false);
            expect(result.error).toBe(errorMessage);
        });
    });

    describe('resetPassword extraReducers', () => {
        it('should handle pending state', () => {
            const action = { type: resetPassword.pending.type };
            const result = passwordResetReducer(initialState, action);
            expect(result.loading).toBe(true);
            expect(result.error).toBeNull();
        });

        it('should handle fulfilled state', () => {
            const action = { type: resetPassword.fulfilled.type };
            const result = passwordResetReducer(initialState, action);
            expect(result.loading).toBe(false);
            expect(result.isPasswordReset).toBe(true);
            expect(result.error).toBeNull();
        });

        it('should handle rejected state', () => {
            const errorMessage = 'Invalid or expired token';
            const action = { type: resetPassword.rejected.type, payload: errorMessage };
            const result = passwordResetReducer(initialState, action);
            expect(result.loading).toBe(false);
            expect(result.isPasswordReset).toBe(false);
            expect(result.error).toBe(errorMessage);
        });
    });
});
