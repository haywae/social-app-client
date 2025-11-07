import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../utils/hooks';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../utils/hooks';
import '../styles/landingPage.css';
import { GoogleIcon } from '../assets/icons';
import { useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { DEVELOPER_MODE } from '../appConfig';
import { googleLogin } from '../thunks/authThunks/googleLoginThunk';
import { setError } from '../slices/ui/uiSlice';

// Define the type for the component's props
interface LoginProps {
    redirectPath?: string;
}

/**
 * A landing page for WolexChange.
 * It focuses on a clean, social media feel with a clear call to action.
 */
const LandingPage = ({ redirectPath }: LoginProps): JSX.Element => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();


    // Select state from the Redux store using the typed selector
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    // Redirect if already authenticated ---
    useEffect(() => {
        if (isAuthenticated) {
            navigate(redirectPath || '/'); // Redirect to the homepage or a specified path
        }
    }, [isAuthenticated, navigate, redirectPath]);

    const googleLoginHook = useGoogleLogin({
        // We use 'auth-code' flow for the most secure server-side verification
        flow: 'auth-code',

        // This 'onSuccess' function runs when Google returns the code
        onSuccess: (codeResponse) => {
            DEVELOPER_MODE && console.log('Google Auth Code:', codeResponse.code);
            dispatch(googleLogin(codeResponse.code));
        },
        onError: (error) => {
            DEVELOPER_MODE && console.error('Google Login Failed:', error);
            dispatch(setError('Google Login Failed'));
        },
    });
    return (
        <div className="landing-page-container">
            <main className="landing-main-content">

                {/* --- Hero Section --- */}
                <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-headline">Hello, I'm Ayowole Badejo.</h1>
                        <p className="hero-subheadline">
                            Welcome to my project showcase. You're looking at a live,
                            interactive demo of "WolexChange," a full-stack social
                            application I built from the ground up.
                        </p>

                        <div className="hero-actions">
                            <div className='hero-actions-row'>
                                <Link to="/register" className="cta-button-primary">
                                    Create Account
                                </Link>
                                <Link to="/login" className="cta-button-secondary">
                                    Log In
                                </Link>
                            </div>
                            <div className='hero-actions-row'>
                                <button type='button' className='cta-button-google' onClick={() => googleLoginHook()}>
                                    <GoogleIcon /> Sign In with Google
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- App Preview Section --- */}
                <section className="app-preview-section">
                        <div className="demo-credentials">
                            <strong>To explore the app:</strong>
                            <p>Log in with the pre-built demo account:</p>
                            <ul>
                                <li><strong>Username:</strong> `iamRecruiter`</li>
                                <li><strong>Password:</strong> `password123`</li>
                            </ul>
                            <p>...or feel free to create your own account.</p>
                        </div>
                    
                </section>

            </main>
        </div>
    );
};

export default LandingPage;
