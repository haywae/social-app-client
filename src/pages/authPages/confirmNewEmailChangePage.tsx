import { useEffect, type JSX, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../utils/hooks';
import { confirmEmailChange } from '../../thunks/settingsThunks/confirmNewEmailChangeThunk';
import { logoutUser } from '../../thunks/authThunks/logoutThunk';
import '../../styles/auth-container.css';

const ConfirmEmailChangePage = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
    const [message, setMessage] = useState('Confirming your new email address...');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            dispatch(confirmEmailChange(token))
                .unwrap()
                .then((response) => {
                    setMessage(`${response.message} For security, you will now be logged out.`);
                    setStatus('success');
                    // For security, log the user out after a successful email change
                    // and redirect them to the login page after a delay.
                    setTimeout( async() => {
                        await dispatch(logoutUser());
                        navigate('/');
                    }, 4000);
                })
                .catch((errorMsg) => {
                    setMessage(errorMsg);
                    setStatus('error');
                });
        } else {
            setMessage('No confirmation token found in the URL. Please check the link in your email.');
            setStatus('error');
        }
    }, [dispatch, location.search, navigate]);

    return (
        <div className="auth-container">
            <h2 className="auth-container-title">Email Change Confirmation</h2>
            <p 
                className={`auth-container-subtitle ${status === 'error' ? 'fg-danger' : ''} ${status === 'success' ? 'fg-success' : ''}`}
            >
                {message}
            </p>
            {status === 'success' && <p>You will be redirected shortly...</p>}
            {status === 'error' && <Link to="/settings" className="login-link">Return to Settings</Link>}
        </div>
    );
};

export default ConfirmEmailChangePage;

