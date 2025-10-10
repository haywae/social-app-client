import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/not-found.css';

/**
 * A component to display when a user navigates to a URL that does not exist.
 * It provides a clear 404 message and a link to return to the homepage.
 */
const NotFoundPage: React.FC = () => {
    return (
        <div className="not-found-page">
            <div className="not-found-content">
                <h1 className="not-found-title">404</h1>
                <h2 className="not-found-subtitle">Page Not Found</h2>
                <p className="not-found-text">
                    Sorry, the page you are looking for does not exist. It might have been moved or deleted.
                </p>
                <Link
                    to="/"
                    className="btn-primary" // Reusing our primary button style
                >
                    Go Back to Homepage
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;