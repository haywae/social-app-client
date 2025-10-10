import { type JSX } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { clearSuccess } from '../../slices/ui/uiSlice';
import { CloseIcon, CheckBadgeIcon } from '../../assets/icons';
import './successToast.css';

/**
 * A toast/banner component that displays a global error message from the UI state.
 * It automatically dismisses after a few seconds.
 */
export const SuccessToast = (): JSX.Element | null => {
    const dispatch = useAppDispatch();
    const { success } = useAppSelector((state) => state.ui);


    if (!success) {
        return null;
    }

    const handleClose = () => {
        dispatch(clearSuccess());
    };

    return (
        <div className="success-toast-container">
            <div className="success-toast-icon">
                <CheckBadgeIcon />
            </div>
            <p className="success-toast-message">{success}</p>
            <button onClick={handleClose} className="success-toast-close-button" aria-label="Close success message">
                <CloseIcon />
            </button>
        </div>
    );
};
