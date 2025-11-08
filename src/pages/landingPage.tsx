import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../utils/hooks';
import { useNavigate } from 'react-router-dom';
import '../styles/landingPage.css';
import { useEffect } from 'react';

// Define the type for the component's props
interface LoginProps {
    redirectPath?: string;
}

/**
 * A landing page.
 * It focuses on a clean, social media feel with a clear call to action.
 */
const LandingPage = ({ redirectPath }: LoginProps): JSX.Element => {
    const navigate = useNavigate();

    // Select state from the Redux store using the typed selector
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    // Redirect if already authenticated ---
    useEffect(() => {
        if (isAuthenticated) {
            navigate(redirectPath || '/'); // Redirect to the homepage or a specified path
        }
    }, [isAuthenticated, navigate, redirectPath]);

    return (
        <div className="landing-page-container">
            <main className="landing-main-content">

                {/* --- Hero Section --- */}
                <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-headline">Hello, <br /> I'm Ayowole Badejo.</h1>
                        <p className="hero-subheadline">
                            Welcome to my project showcase. You are viewing a live,
                            interactive <strong>lite-version</strong> of my full-stack
                            application, "WolexChange".
                        </p>
                        <p className="hero-subheadline">
                            I built this entire platform—from the <strong> React/Redux </strong> frontend to the
                            <strong> Python/Flask API </strong> with WebSockets—to demonstrate my skills.
                            The full, production version is live at:
                            <br />
                            <a
                                href="https://www.wolexchange.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hero-prod-link"
                            >
                                www.wolexchange.com
                            </a>
                        </p>


                        <div className="hero-actions">
                            <div className='hero-actions-row'>
                                <Link to="/register" className="cta-button-primary">
                                    Create Account
                                </Link>
                                <Link to="/login" className="cta-button-secondary">
                                    Log In
                                </Link>
                                <a 
                                    href="https://www.wolexchange.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="cta-button-secondary"
                                >
                                    View Full Site
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- App Preview Section --- */}
                <div className="demo-credentials">
                    <strong>To explore the demo:</strong>
                    <p>Log in with any demo account <br /> (password: <code>User*123</code>)</p>
                    <ul className="demo-accounts-list-landing">
                        <li><code>username: user1</code></li>
                        <li><code>username: user2</code></li>
                        <li><code>username: user3</code></li>
                    </ul>
                    <p>...or feel free to create your own account.</p>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;
