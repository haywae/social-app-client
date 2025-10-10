import { describe, it, expect } from 'vitest';
import registrationReducer, { resetRegistrationState } from '../../slices/user/resgitrationSlice';
import { registerUser } from '../../thunks/userThunks/registerThunk';
import type { RegistrationState } from '../../slices/user/resgitrationSlice';

describe('registrationSlice', () => {
    // Define the initial state for reference in tests
    const initialState: RegistrationState = {
        loading: false,
        error: null,
    };

    it('should return the initial state when called with an unknown action', () => {
        // Arrange: No specific state, an action the reducer doesn't recognize
        const action = { type: 'unknown/action' };
        
        // Act: Call the reducer with an undefined state
        const result = registrationReducer(undefined, action);

        // Assert: It should return the exact initial state
        expect(result).toEqual(initialState);
    });

    describe('resetRegistrationState reducer', () => {
        it('should reset loading and error to their initial values', () => {
            // Arrange: Create a state that has an error and is loading
            const currentState: RegistrationState = { loading: true, error: 'Something went wrong' };

            // Act: Dispatch the reset action
            const result = registrationReducer(currentState, resetRegistrationState());

            // Assert: The state should be fully reset
            expect(result).toEqual(initialState);
        });
    });

    describe('registerUser extraReducers', () => {
        it('should set loading to true on registerUser.pending', () => {
            // Arrange
            const action = { type: registerUser.pending.type };

            // Act
            const result = registrationReducer(initialState, action);

            // Assert
            expect(result.loading).toBe(true);
            expect(result.error).toBeNull();
        });

        it('should set loading to false on registerUser.fulfilled', () => {
            // Arrange: Start with a loading state
            const currentState: RegistrationState = { loading: true, error: null };
            const action = { type: registerUser.fulfilled.type };

            // Act
            const result = registrationReducer(currentState, action);

            // Assert
            expect(result.loading).toBe(false);
            expect(result.error).toBeNull();
        });

        it('should set loading to false and set an error message on registerUser.rejected', () => {
            // Arrange
            const errorMessage = 'Username already exists';
            const action = { type: registerUser.rejected.type, payload: errorMessage };

            // Act
            const result = registrationReducer(initialState, action);

            // Assert
            expect(result.loading).toBe(false);
            expect(result.error).toBe(errorMessage);
        });

        it('should use a default error message if the rejection payload is undefined', () => {
            // Arrange
            const action = { type: registerUser.rejected.type, payload: undefined };

            // Act
            const result = registrationReducer(initialState, action);

            // Assert
            expect(result.loading).toBe(false);
            expect(result.error).toBe('An unknown registration error occurred');
        });
    });
});
