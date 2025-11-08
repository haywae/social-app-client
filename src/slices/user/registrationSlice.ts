import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { registerUser } from "../../thunks/userThunks/registerThunk";

/**
 * Defines the shape of the registration process state.
 */
export interface RegistrationState {
    loading: boolean;
    error: string | null;
}

/**
 * The initial state for the registration slice.
 */
const initialState: RegistrationState = {
    loading: false,
    error: null,
};

const registrationSlice = createSlice({
    name: "registration",
    initialState,
    reducers: {
        /**
         * Resets the registration state to its initial values.
         * Useful for clearing errors after the user has acknowledged them.
         */
        resetRegistrationState: (state) => {
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload || 'An unknown registration error occurred';
            });
    }
});

export const { resetRegistrationState } = registrationSlice.actions;
export default registrationSlice.reducer;
