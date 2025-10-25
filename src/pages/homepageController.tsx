import { useAppSelector } from '../utils/hooks';
import { Navigate } from 'react-router-dom';
import LandingPage from './landingPage';
import FullPageLoader from '../components/common/fullPageLoader';
import type { JSX } from 'react';


/**
 * This component acts as a controller for the root path ('/').
 * It checks the authentication status after the initial load and directs
 * the user to the appropriate experience.
 */
const HomePage = (): JSX.Element => {
  const { isAuthenticated, loading } = useAppSelector(state => state.auth);

  // While the initial authentication check is running, show a loading state
  // to prevent a "flash" of the wrong content.
  if (loading === 'pending' || loading === 'idle') {
    return <FullPageLoader />;
  }

  // If the check is complete and the user is authenticated, redirect them to the main feed.
  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  // If the check is complete and the user is not authenticated, show the public landing page.
  return <LandingPage />;
};

export default HomePage;

