import { type JSX, useState } from 'react';
import { useAppDispatch } from '../../utils/hooks';
import { resendVerificationForAuthUser } from '../../thunks/userThunks/resendVerificationForAuthUserThunk';
import { setError, setSuccess } from '../../slices/ui/uiSlice';

/**
 * A component for authenticated users to resend their verification email.
 * This should be placed within a settings or account management page.
 */
const ResendVerification = (): JSX.Element => {
    const dispatch = useAppDispatch();
    // --- Local state for loading, as requested ---
    const [isLoading, setIsLoading] = useState(false);

    const handleResendClick = async () => {
        if (isLoading) return;
        setIsLoading(true);
        
        try {
            // .unwrap() will return the success payload or throw the rejection payload
            const result = await dispatch(resendVerificationForAuthUser()).unwrap();
            
            // On success, dispatch the success message to the global UI slice
            dispatch(setSuccess(result.message));

        } catch (err: any) {
            // On failure, dispatch the error message to the global UI slice
            dispatch(setError(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="settings-form-section">
            <h3 className="card-info h3">Verify Your Email</h3>
            <div className="card-info ">
                <p>Your account is not verified. Please check your inbox for the verification link, or send a new one.</p>
                <button
                    className="btn-primary"
                    onClick={handleResendClick}
                    disabled={isLoading}
                >
                    {isLoading ? 'Sending...' : 'Resend Verification Email'}
                </button>
            </div>
        </div>
    );
};

export default ResendVerification;

