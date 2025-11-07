import type { JSX } from 'react';
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
                <div className="auth-footer-copyright">
                    &copy; {currentYear} Ayowole Badejo
                </div>
            </div>
        </footer>
    );
};

export default AuthFooter;
