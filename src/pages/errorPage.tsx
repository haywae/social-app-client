import { type JSX } from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import '../styles/errorPage.css'; // We'll c

const ErrorPage = (): JSX.Element => {
    // This hook catches the error and provides it to your component
    const error = useRouteError() as Error;
    const navigate = useNavigate();

    console.error(error); // It's still a good idea to log the full error

    return (
        <div className="error-page-container">
            <div className="error-content">
                <h1>Oops!</h1>
                <p>Sorry, an unexpected error has occurred.</p>
                <p className="error-message">
                    <i>{error.message || 'Unknown Error'}</i>
                </p>
                <button onClick={() => navigate('/')} className="btn-primary">
                    Go to Homepage
                </button>
            </div>
        </div>
    );
};

export default ErrorPage;