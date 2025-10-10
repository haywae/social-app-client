import { useEffect, type JSX } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { clearError } from '../../slices/ui/uiSlice';
import { CloseIcon, AlertTriangleIcon } from '../../assets/icons';
import './errorToast.css';

/**
 * A toast/banner component that displays a global error message from the UI state.
 * It automatically dismisses after a few seconds.
 */
export const ErrorToast = (): JSX.Element | null => {
    const dispatch = useAppDispatch();
    const { error } = useAppSelector((state) => state.ui);

    // Effect to automatically clear the error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                dispatch(clearError());
            }, 5000); // Auto-dismiss after 5 seconds

            // Cleanup function to clear the timer if the component unmounts
            // or if the error changes before the timer finishes.
            return () => clearTimeout(timer);
        }
    }, [error, dispatch]);

    if (!error) {
        return null;
    }

    const handleClose = () => {
        dispatch(clearError());
    };

    return (
        <div className="error-toast-container">
            <div className="error-toast-icon">
                <AlertTriangleIcon />
            </div>
            <p className="error-toast-message">{error}</p>
            <button onClick={handleClose} className="error-toast-close-button" aria-label="Close error message">
                <CloseIcon />
            </button>
        </div>
    );
};
