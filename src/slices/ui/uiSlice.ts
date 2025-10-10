import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UiState {
    error: string | null;
    success: string | null;
    modalType:
    | 'REPLY' | 'VIEW_AVATAR' | 'EDIT_POST' | 'EDIT_COMMENT'
    | 'CONFIRM_DELETE_POST' | 'CONFIRM_DELETE_COMMENT' | 'EDIT_EXCHANGE_DETAILS'
    | 'CONFIRM_DELETE_ACCOUNT' | null;
    modalProps: Record<string, any>;
}

const initialState: UiState = {
    error: null,
    success: null,
    modalType: null,
    modalProps: {}
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
    },
});

export const { setError, clearError, setSuccess, clearSuccess, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
