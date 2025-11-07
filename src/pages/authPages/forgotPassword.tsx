import { useState, useEffect, type ChangeEvent, type FormEvent, type JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../utils/hooks";
import { requestPasswordReset } from "../../thunks/userThunks/requestPasswordResetThunk";
import { resetPasswordResetState } from "../../slices/user/passwordResetSlice";
import { setError } from "../../slices/ui/uiSlice";
import "../../styles/auth-container.css";

const ForgotPassword = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const [email, setEmail] = useState<string>('');
    const navigate = useNavigate();

    /**
     * This effect runs when the component unmounts (e.g., user navigates away).
     * It dispatches an action to reset the slice's state, ensuring that if the user
     * navigates back, they will see the form again, not the success message.
     */
    useEffect(() => {
        return () => {
            dispatch(resetPasswordResetState());
        };
    }, [dispatch]);

    const { isEmailSent, loading } = useAppSelector((state) => state.passwordReset);
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    // Redirect if already authenticated ---
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    /**
     * Handles changes to the email input field and clears any existing errors.
     * @param e - The input change event.
     */
    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setEmail(e.target.value);
    };

    /**
     * Handles form submission, performs validation, and dispatches the password reset request.
     * @param e - The form submission event.
     */
    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        // --- Checks if an email was entered ---
        if (!email) {
            dispatch(setError('Please enter your email address.'));
            return;
        }

        try {
            // --- Executes the request-password-reset function ---
            await dispatch(requestPasswordReset(email)).unwrap();
        } catch (err: any) {
            dispatch(setError('There was a problem sending the password reset link. Please try again. Error: ' + err));
        }
    }

    return (
        <>
        <title>Forgot Password - WolexChange</title>
        <div className="auth-container">
            <h2 className="auth-container-title">Forgot Password</h2>
            {isEmailSent ? (
                <p className="success-message">
                    An email with password reset instructions has been sent to {email}.
                </p>
            ) : (
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="email">Enter your email address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {/* Submit button */}
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {'Send Reset Link'}
                    </button>
                </form>
            )}
            <div className="links">
                <Link to="/login" className="back-to-login-link">
                    Back to Login
                </Link>
            </div>
        </div>
        </>
    );
}

export default ForgotPassword;
