import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { submitContactForm } from "../../thunks/legalThunks/contactFormThunk";

export interface UiState {
    error: string | null;
    success: string | null;
    modalType:
    | 'REPLY' | 'VIEW_AVATAR' | 'EDIT_POST' | 'EDIT_COMMENT'
    | 'CONFIRM_DELETE_POST' | 'CONFIRM_DELETE_COMMENT' | 'EDIT_EXCHANGE_DETAILS'
    | 'CONFIRM_DELETE_ACCOUNT' | null;
    modalProps: Record<string, any>;
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
}

const initialState: UiState = {
    error: null,
    success: null,
    modalType: null,
    modalProps: {},
    loading: 'idle',
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        /** Sets the global error message. Setting this to a string will cause the ErrorModal to appear.*/
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        /** Clears the global error message, which will hide the ErrorModal. */
        clearError: (state) => {
            state.error = null;
        },
        /** Sets the global success message. Setting this to a string will cause the SuccessModal to appear.*/
        setSuccess: (state, action: PayloadAction<string>) => {
            state.success = action.payload;
        },
        /** Clears the global success message, which will hide the SuccessModal.*/
        clearSuccess: (state) => {
            state.success = null;
        },
        /** Opens the modal component based on the modal type passed as the action \
         * It also passes along the properties needed for the modal to render
         */
        openModal: (state, action: PayloadAction<{ modalType: UiState['modalType']; modalProps?: Record<string, any> }>) => {
            state.modalType = action.payload.modalType;
            state.modalProps = action.payload.modalProps || {};
        },
        closeModal: (state) => {
            state.modalType = null;
            state.modalProps = {};
        },
        resetContactState: (state) => {
            state.loading = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // When the form submission starts
            .addCase(submitContactForm.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            // When the submission is successful
            .addCase(submitContactForm.fulfilled, (state) => {
                state.loading = 'succeeded';
            })
            // When the submission fails
            .addCase(submitContactForm.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.loading = 'failed';
                state.error = action.payload || 'An unknown error occurred.';
            });
    },
});

export const { setError, clearError, setSuccess, clearSuccess, openModal, closeModal, resetContactState } = uiSlice.actions;
export default uiSlice.reducer;
