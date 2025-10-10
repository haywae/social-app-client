import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { verifyEmail } from "../../thunks/userThunks/verifyEmailThunk";

interface VerifyEmailState {
    loading: 'idle' | 'pending';
    error: string | null;
    successMessage: string | null;
}

const initialState: VerifyEmailState = {
    loading: 'idle',
    error: null,
    successMessage: null,
};

const verifyEmailSlice = createSlice({
    name: "verifyEmail",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(verifyEmail.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
                state.successMessage = null;
            })
            .addCase(verifyEmail.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = 'idle';
                state.successMessage = action.payload;
            })
            .addCase(verifyEmail.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.loading = 'idle';
                state.error = action.payload || 'An unknown error occurred.';
            });
    }
});

export default verifyEmailSlice.reducer;