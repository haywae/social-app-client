import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { requestEmailChange } from "../../thunks/settingsThunks/requestEmailChangeThunk"; 

interface EmailChangeState {
    loading: boolean;
    error: string | null;
    successMessage: string | null;
}

const initialState: EmailChangeState = {
    loading: false,
    error: null,
    successMessage: null,
};

const emailChangeSlice = createSlice({
    name: "emailChange",
    initialState,
    reducers: {
        resetEmailChangeState: (state) => {
            state.loading = false;
            state.error = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(requestEmailChange.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(requestEmailChange.fulfilled, (state, action: PayloadAction<{ message: string }>) => {
                state.loading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(requestEmailChange.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload || 'An unknown error occurred.';
            });
    }
});

export const { resetEmailChangeState } = emailChangeSlice.actions;
export default emailChangeSlice.reducer;

