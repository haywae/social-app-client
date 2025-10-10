import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { requestPasswordReset} from "../../thunks/userThunks/requestPasswordResetThunk";
import { resetPassword } from "../../thunks/userThunks/resetPasswordThunk";

/**
 * Defines the shape of the password reset process state.
 */
export interface PasswordResetState {
    isEmailSent: boolean;
    isPasswordReset: boolean;
    loading: boolean;
    error: string | null;
}

/**
 * The initial state for the password reset slice.
 */
const initialState: PasswordResetState = {
    isEmailSent: false,
    isPasswordReset: false,
    loading: false,
    error: null,
};

const passwordResetSlice = createSlice({
    name: 'passwordReset',
    initialState,
    reducers: {
        /**
         * Resets the entire password reset flow state to its initial values.
         */
        resetPasswordResetState: (state) => {
            state.isEmailSent = false;
            state.isPasswordReset = false;
            state.loading = false;
            state.error = null;
        },
        /**
         * Clears any existing error message from the state.
         */
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Cases for requesting a password reset email
            .addCase(requestPasswordReset.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestPasswordReset.fulfilled, (state) => {
                state.loading = false;
                state.isEmailSent = true;
                state.error = null;
            })
            .addCase(requestPasswordReset.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.isEmailSent = false;
                state.error = action.payload || 'Failed to send reset email.';
            })
            
            // Cases for submitting the new password
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.loading = false;
                state.isPasswordReset = true;
                state.error = null;
            })
            .addCase(resetPassword.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.isPasswordReset = false;
                state.error = action.payload || 'Failed to reset password.';
            });
    }
});

export const { resetPasswordResetState, clearError } = passwordResetSlice.actions;
export default passwordResetSlice.reducer;
