import { useAppSelector } from '../../utils/hooks';
import { Navigate, useLocation } from 'react-router-dom';
import { type JSX } from 'react';


/**
 * This component wraps authenticated routes.
 * It checks if the user has completed the onboarding process.
 * If not, it redirects them to the /complete-profile page.
 */
export const OnboardingCheck = ({ children }: { children: JSX.Element }) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const location = useLocation();

  // Don't check if user isn't loaded or isn't logged in
  if (!isAuthenticated || !user) {
    return children;
  }

  // Check for the "incomplete" fields
  const needsOnboarding = !user.country || !user.dateOfBirth;

  if (needsOnboarding && location.pathname !== '/complete-profile') {
    // Redirect them to the onboarding page if they try to go anywhere else
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
};