import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../utils/hooks';
import { useNavigate } from 'react-router-dom';
import '../styles/landingPage.css';
import { HeartIcon, ChatIcon, LinkIcon } from '../assets/icons';
import { useEffect } from 'react';
import { allCurrencies } from '../assets/currencies';

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

    // Select state from the Redux store using the typed selector
    const { isAuthenticated } = useAppSelector((state) => state.auth);
        // Redirect if already authenticated ---
        // This effect runs when the component mounts or when `isAuthenticated` changes.
        // If the user is logged in, it redirects them away from the landing page.
        useEffect(() => {
            if (isAuthenticated) {
                navigate(redirectPath || '/'); // Redirect to the homepage or a specified path
            }
        }, [isAuthenticated, navigate, redirectPath]);

        const USD_SYMBOL = allCurrencies.find(c => c.iso3 === 'USD')?.symbol;
        const GBP_SYMBOL = allCurrencies.find(c => c.iso3 === 'GBP')?.symbol;
        const EUR_SYMBOL = allCurrencies.find(c => c.iso3 === 'EUR')?.symbol;
    return (
        <div className="landing-page-container">
            <main className="landing-main-content">

                {/* --- Hero Section --- */}
                <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-headline">Join the Conversation on Currency.</h1>
                        <p className="hero-subheadline">
                            WolexChange is the community-driven platform for sharing and discovering real-time exchange rates. See what’s happening in the market, right now.
                        </p>
                        <div className="hero-actions">
                            <Link to="/register" className="cta-button-primary">
                                Create Account
                            </Link>
                            <Link to="/login" className="cta-button-secondary">
                                Log In
                            </Link>
                        </div>
                    </div>
                </section>

                {/* --- App Preview Section --- */}
                <section className="app-preview-section">
                    <div className="app-preview-container">
                        {/* This is a static mock-up of a post to visually represent the app's core feature */}
                        <div className="mock-post">
                            <div className="mock-post-header">
                                <img src="https://cdn.pixabay.com/photo/2025/10/09/08/14/mushroom-9883036_1280.jpg" alt="" className='mock-avatar' />
                                <div className="mock-author-info">
                                    <span className="mock-display-name">Diamond Finance</span>
                                    <span className="mock-username">@diamondexchange</span>
                                </div>
                            </div>
                            <div className="mock-post-content">
                                <p>
                                    <span className='from-text'>Fresh rates from Nigeria by</span>
                                    <span className='via-exchange'>Diamond Finance</span>
                                </p>
                                <div className="mock-rates">
                                    <p>{USD_SYMBOL} USD<br />Buy: 1450.00 | Sell: 1465.00</p>
                                    <p>{GBP_SYMBOL} GBP<br />Buy: 1820.00 | Sell: 1840.00</p>
                                    <p>{EUR_SYMBOL} EUR<br />Buy: 1550.00 | Sell: 1570.00</p>
                                </div>
                                <p className="mock-hashtags">#USD #GBP #EUR</p>
                            </div>
                            <div className="mock-post-actions">
                                {/* Simplified SVG icons for actions */}
                                <span className='mock-action-item'><ChatIcon/> 12</span>
                                <span className='mock-action-item'><HeartIcon/> 45</span>
                                <span className='mock-action-item'><LinkIcon/></span>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default LandingPage;
