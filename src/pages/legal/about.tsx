import type { JSX } from 'react';
import './legalPages.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { LeftArrowIcon } from '../../assets/icons';
import { useTitle } from '../../utils/hooks';



const AboutPage = (): JSX.Element => {
    const location = useLocation();
    const navigate = useNavigate();
    const handleNavigate = () => {
        // Check if the user was navigated to this page from within the app
        if (location.key !== 'default') {
            // If there's a history stack, go back one step
            navigate(-1);
        } else {
            navigate('/'); // The public homepage
        }
    };

    useTitle('About - WolexChange');

    return (
        <div className="legal-page-container">
            <header className="legal-page-header">
                <button onClick={handleNavigate} className="legal-back-button"><LeftArrowIcon /></button>
                <h1>About WolexChange</h1>
                <p className="subtitle">Connecting You with Real-Time Currency Rates</p>
            </header>

            <section className="legal-page-section">
                <h2>Our Mission</h2>
                <p>
                    Welcome to WolexChange, the social hub for currency exchange! Our mission is to make currency exchange more open, transparent, and connected for everyone. We believe that finding reliable rate information shouldn't be a challenge.
                </p>
            </section>

            <section className="legal-page-section">
                <h2>What is WolexChange?</h2>
                <p>
                    WolexChange is a specialized social platform designed to connect individuals and businesses around the sharing and discovery of real-time currency exchange rates. Whether you're a business, a traveler, or just keeping an eye on the market, WolexChange empowers you to create a public profile and share your own buy/sell rates with a community you can trust.
                </p>
            </section>

            <section className="legal-page-section">
                <h2>Key Features</h2>
                <ul>
                    <li><strong>Share Your Rates:</strong> Create a profile and post your own buy and sell rates for various currencies to a public feed.</li>
                    <li><strong>Discover and Connect:</strong> Follow other users to see their rates on your personalized feed, and discover what's available around you.</li>
                    <li><strong>Interact:</strong> Engage with the community by liking and commenting on posts.</li>
                    <li><strong>Convert with Ease:</strong> Use our handy, integrated currency converter to make quick calculations based on user-provided rates.</li>
                </ul>
            </section>

            <section className="legal-page-section">
                <h2>Our Commitment</h2>
                <p>
                    Please note that WolexChange is an informational and social service only. We are not a financial institution and do not facilitate or process any financial transactions. Our goal is to provide a transparent venue for users to share information and connect with one another.
                </p>
                <p>
                    Thank you for being a part of our growing community!
                </p>
            </section>
        </div>
    );
};

export default AboutPage;
