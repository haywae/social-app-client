import React, { type JSX } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../../utils/hooks';
import Login from '../../pages/authPages/login';
import type { RootState } from '../../store';

// A simple placeholder for the component being wrapped
type WrappedComponentProps = React.ComponentProps<any>;

/**
 * A Higher-Order Component that protects routes by ensuring a user is authenticated.
 * It handles loading states and redirects to the login page if necessary.
 * @param Component The component to render if the user is authenticated.
 * @returns A new component that wraps the original with authentication logic.
 */
const withAuth = (Component: React.ComponentType<WrappedComponentProps>) => {
    
    const AuthenticatedComponent = (props: WrappedComponentProps): JSX.Element | null => {
        const location = useLocation();

        const { isAuthenticated, loading } = useAppSelector((state: RootState) => state.auth)

        // 1. First, check the loading state.
        // We render nothing during the initial 'idle' state and the 'pending' state
        // while the app is verifying the user's session.
        if (loading === 'idle' || loading === 'pending') {
            return null;
        }
        
        // 2. After the check, if the user is authenticated, render the protected component.
        if (isAuthenticated) {
            return <Component {...props} />;
        }


        // 3. If loading is finished and the user is not authenticated, render the Login page.
        // This will catch both initially unauthenticated users and failed auth checks.
        return (
            <>
                <Login redirectPath={location.pathname} />
            </>
        )
    };

    return AuthenticatedComponent;
};

export default withAuth;
