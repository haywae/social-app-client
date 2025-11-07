import { useEffect, useState, type ChangeEvent, type FormEvent, type JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import { loginUser } from "../../thunks/authThunks/loginThunk";
import { setError, setSuccess } from "../../slices/ui/uiSlice";
import "../../styles/auth-container.css"

// Define the type for the component's props
interface LoginProps {
    redirectPath?: string;
}

/**
 * A component that renders the user login form. It handles user input,
 * dispatches the login action, and manages loading and error states.
 *
 * @param {LoginProps} props - The component props.
 * @param {string} [props.redirectPath] - The path to redirect to after a successful login.
 */
const Login = ({ redirectPath }: LoginProps): JSX.Element => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Select state from the Redux store using the typed selector
    const { loading, isAuthenticated } = useAppSelector((state) => state.auth);
    const isLoading = loading === 'pending';

    // State for form fields and client-side validation
    const [password, setPassword] = useState<string>('');
    const [loginIdentifier, setLoginIdentifier] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false); //

    // Redirect if already authenticated ---
    // This effect runs when the component mounts or when `isAuthenticated` changes.
    // If the user is logged in, it redirects them away from the login page.
    useEffect(() => {
        if (isAuthenticated) {
            navigate(redirectPath || '/'); // Redirect to the homepage or a specified path
        }
    }, [isAuthenticated, navigate, redirectPath]);

    /**
     * Handles changes to the username/email input field.
     * @param e - The input change event.
     */
    const handleIdentifierChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLoginIdentifier(e.target.value);
    };

    /**
     * Handles changes to the password input field.
     * @param e - The input change event.
     */
    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    /**
     * Handles the form submission event.
     * @param e - The form submission event.
     */
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!loginIdentifier || !password) {
            dispatch(setError('Please enter both username/email and password.'));
            return;
        }

        try {
            // Dispatch the login thunk and use unwrap() to handle the promise
            await dispatch(loginUser({ loginIdentifier, password })).unwrap();
            dispatch(setSuccess('Welcome dear recruiter, thanks for checking out my application'))
        } catch (err: any) {
            dispatch(setError(err));
            setPassword('');
        }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-container-title">Login</h2>
            <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                    <label htmlFor="loginIdentifier">Username/Email</label>
                    <input
                        type="text"
                        id="loginIdentifier"
                        name="loginIdentifier"
                        value={loginIdentifier}
                        onChange={handleIdentifierChange}
                        required
                        autoComplete="username"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {'Log in'}
                </button>
            </form>
            <div className="links">
                <Link to="/register" className="signup-link">Sign Up</Link>
                <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
            </div>
        </div>
    );
};

export default Login;
