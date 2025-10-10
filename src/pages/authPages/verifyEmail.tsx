import { useEffect, type JSX } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { verifyEmail } from '../../thunks/userThunks/verifyEmailThunk';
import '../../styles/auth-container.css';

const VerifyEmailPage = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const { loading, error, successMessage } = useAppSelector((state) => state.verifyEmail);

    useEffect(() => {
        // Extract the token from the URL query parameters (e.g., ?token=...)
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            dispatch(verifyEmail(token));
        }
    }, [dispatch, location.search]);

    const renderContent = () => {
        if (loading === 'pending') {
            return <p className="auth-container-subtitle">Verifying your email...</p>;
        }
        if (error) {
            return (
                <>
                    <p className="auth-container-subtitle">{error}</p>
                    <Link to="/login" className="login-link">Try logging in again</Link>
                </>
            );
        }
        if (successMessage) {
            return (
                <>
                    <p className="auth-container-subtitle">{successMessage}</p>
                    <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>
                        Proceed to Login
                    </Link>
                </>
            );
        }
        // Fallback message if no token is found in the URL
        return <p className="auth-container-subtitle">No verification token found. Please check the link from your email.</p>;
    };

    return (
        <div className="auth-container">
            <h2 className="auth-container-title">Email Verification</h2>
            {renderContent()}
        </div>
    );
};

export default VerifyEmailPage;