import { useState, useEffect, type ChangeEvent, type FormEvent, type JSX } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { resetPassword } from '../../thunks/userThunks/resetPasswordThunk'; 
import { resetPasswordResetState } from '../../slices/user/passwordResetSlice'; 
import { setError } from '../../slices/ui/uiSlice';
import type { ResetPasswordCredentials } from '../../thunks/userThunks/resetPasswordThunk';
import "../../styles/auth-container.css"

const ResetPassword = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Use useParams to get the token from the route 
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = (queryParams.get('token') || ''); // Get token from URL query params

    // --- Redux state ---
    const { isPasswordReset, loading } = useAppSelector((state) => state.passwordReset);
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    // --- Local state ---
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');

    // Redirect if already authenticated ---
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/'); // Redirect to the homepage
        }
    }, [isAuthenticated, navigate]);

    /**
     * This effect runs when the component unmounts. It resets the password slice
     * to its initial state, ensuring a clean state if the user navigates back.
     */
    useEffect(() => {
        return () => {
            dispatch(resetPasswordResetState());
        };
    }, [dispatch]);

    
    // --- Event Handlers ---
    const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setNewPassword(e.target.value);
    };

    const handleConfirmNewPasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setConfirmNewPassword(e.target.value);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!newPassword || !confirmNewPassword) {
            dispatch(setError('Please fill in all fields.'));
            return;
        }

        if (newPassword !== confirmNewPassword) {
            dispatch(setError('Passwords do not match.'));
            return;
        }

        try {

            if (!token) {
                dispatch(setError('Invalid password reset link.'));
                return;
            }

            const credentials: ResetPasswordCredentials = { token, newPassword };
            
            await dispatch(resetPassword(credentials)).unwrap();
            
            // On success, the useEffect below will handle redirection.

        } catch (err: any) {

            dispatch(setError(err || 'Password reset failed. Please try again.'));
        }
    };

    // --- Side Effects ---
    // Redirects the user to the login page after a successful password reset.
    useEffect(() => {
        if (isPasswordReset) {
            // Optional: Show a success message briefly before redirecting
            // For now, redirects immediately.
            navigate('/login');
        }
    }, [isPasswordReset, navigate]);

    return (
        <div className="auth-container">
            <h2 className="auth-container-title">Reset Password</h2>
            <form onSubmit={handleSubmit} noValidate>
                {/* Password Field */}
                <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={newPassword}
                        onChange={handleNewPasswordChange}
                        required
                    />
                </div>
                {/* Confirm Password Field */}
                <div className="form-group">
                    <label htmlFor="confirmNewPassword">Confirm New Password</label>
                    <input
                        type="password"
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        value={confirmNewPassword}
                        onChange={handleConfirmNewPasswordChange}
                        required
                    />
                </div>
                {/* Submit Button */}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {'Reset Password'}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;
