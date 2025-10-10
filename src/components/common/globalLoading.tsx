import  { type JSX } from 'react';
import { useAppSelector } from '../../utils/hooks'; // Adjust path
import './globalLoading.css'; // We will create this file next

/**
 * A global loading indicator that displays an overlay and spinner when any
 * part of the application is in a loading state.
 */
const GlobalLoading = (): JSX.Element | null => {
    // Select the loading state from all relevant slices
    const isAuthLoading = useAppSelector((state) => state.auth.loading);
    const isRegistrationLoading = useAppSelector((state) => state.registration.loading);
    const isPasswordResetLoading = useAppSelector((state) => state.passwordReset.loading);
    const isProfileLoading = useAppSelector((state) => state.profile.loading === 'pending' || state.profile.loading === 'idle');

    // Determine if the loader should be visible
    const shouldShow = isAuthLoading === 'pending' || isRegistrationLoading || isPasswordResetLoading || isProfileLoading;

    // If nothing is loading, render nothing
    if (!shouldShow) {
        return null; // Return an empty fragment
    }

    // Otherwise, render the loading overlay
    return (
        <div className="global-loading-overlay">
            <div className="global-spinner"></div>
        </div>
    );
};

export default GlobalLoading;
