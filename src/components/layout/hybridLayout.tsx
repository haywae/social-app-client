import { useAppSelector } from '../../utils/hooks.ts';
import { type JSX } from 'react';
import FullPageLoader from '../common/fullPageLoader.tsx';
import App from '../../App.tsx';
import AuthLayout from './authLayout.tsx';

/**
 * A layout component that conditionally renders the appropriate layout
 * based on authentication status.
 * - Authenticated users get the full <App /> layout.
 * - Unauthenticated users get the <AuthLayout /> guest layout.
 * Both <App /> and <AuthLayout /> contain their own <Outlet /> components,
 */
const HybridLayout = (): JSX.Element => {
    const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

    // Show a loader while authentication status is being checked
    if (loading === 'pending' || loading === 'idle') {
        return (
            <div>
                <FullPageLoader />
            </div>
        );
    }

    if (isAuthenticated) {
        // Render the full app layout, which contains an <Outlet />
        return <App />;
    }
    
    // Render the guest layout, which also contains an <Outlet />
    return <AuthLayout />;
};

export default HybridLayout;

