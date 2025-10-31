import { useAppSelector } from '../../utils/hooks';
import { useLocation } from 'react-router-dom';
import { type JSX } from 'react';
import LandingPage from '../../pages/landingPage';
import FullPageLoader from '../common/fullPageLoader';
import ConnectionError from './connectionError';

/**
 * A wrapper component that protects routes requiring authentication.
 * If the user is authenticated, it renders the child components (e.g., the main app layout).
 * If not, it renders the LandingPage, passing the intended redirect path.
 * It also handles the initial loading state to prevent flickering.
 */
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);
    const location = useLocation();

    // While checking the session, show a loading indicator or nothing at all.
    // This prevents a brief flash of the landing page for authenticated users.
    if (loading === 'pending' || loading === 'idle') {
        // You can replace this with a dedicated loading spinner component
        return (
            <div>
                <FullPageLoader />
            </div>
        );
    }

    if (loading === 'failed' && error) {
        // You would create a dedicated component for this
        return (
            <ConnectionError />
        );
    }

    // After checking, if the user is authenticated, render the protected content.
    if (isAuthenticated) {
        return children;
    }

    // If the check is complete and the user is not authenticated, render the landing page.
    // We pass the path they were trying to access so they can be redirected after login.
    return (
        <div className='guest-content'>
            <LandingPage redirectPath={location.pathname} />
        </div>
    );
};

export default ProtectedRoute;

