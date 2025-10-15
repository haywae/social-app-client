import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import './authFooter.css';

/**
 * A simple footer component for use on authentication pages like Login and Register.
 * It provides essential links and a copyright notice.
 */
const AuthFooter = (): JSX.Element => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="auth-footer">
            <div className="auth-footer-content">
                <nav className="auth-footer-links">
                    <Link to="/about">About</Link>
                    <Link to="/privacy-policy">Privacy Policy</Link>
                    <Link to="/terms-and-conditions">Terms</Link>
                    <Link to="/cookie-policy">Cookie Policy</Link>
                    <Link to="/contact">Contact Us</Link>
                </nav>
                <div className="auth-footer-copyright">
                    &copy; {currentYear} WolexChange
                </div>
            </div>
        </footer>
    );
};

export default AuthFooter;
