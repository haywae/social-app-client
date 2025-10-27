import { useAppSelector } from '../../utils/hooks.ts';
import { type JSX } from 'react';
import FullPageLoader from '../common/fullPageLoader.tsx';
import App from '../../App.tsx'; // The authenticated layout
import AuthLayout from './authLayout.tsx'; // The guest layout

/**
 * A layout component that conditionally renders the appropriate layout
 * based on authentication status.
 * - Authenticated users get the full <App /> layout.
 * - Unauthenticated users get the <AuthLayout /> guest layout.
 * This is used for pages that are accessible to both, but look different
 * for each (e.g., /view).
 *
 * Both <App /> and <AuthLayout /> contain their own <Outlet /> components,
 * so the child route (e.g., <ViewPage />) will render inside the correct layout.
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
        // for the nested hybrid route (e.g., ViewPage)
        return <App />;
    }

    // Render the guest layout, which also contains an <Outlet />
    // for the nested hybrid route (e.g., ViewPage)
    return <AuthLayout />;
};

export default HybridLayout;

