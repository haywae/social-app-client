import { useEffect, type JSX } from "react";
import { Outlet, useLocation, matchPath } from "react-router-dom";
import { checkAuth } from "./thunks/authThunks/authCheckThunk";
import { fetchSettings } from "./thunks/settingsThunks/fetchSettingsThunk";
import { fetchNotifications } from "./thunks/notificationThunks/notificationListThunk";
import { useAppSelector, useAppDispatch } from "./utils/hooks";
import { setAuthFromSync } from "./slices/auth/authSlice";
import MobileHeader from "./components/layout/mobileHeader";
import RightSidebar from "./components/layout/rightSidebar";
import LeftSidebar from "./components/layout/leftSidebar";
import { ErrorToast } from "./components/common/errorToast";
import { SuccessToast } from "./components/common/successToast";
import ModalManager from "./components/common/modalManager";
import { DEVELOPMENT_MODE } from "./appConfig";
import "./styles/App.css";

/** Custom hook to manage global authentication side-effects. */
const useAuthEffects = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    // EFFECT 1: For Syncing the Auth State Across Tabs
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            // Check if the event is our specific auth-sync event
            if (event.key === 'auth-sync' && event.newValue) {
                DEVELOPMENT_MODE && console.log('Auth state synced from another tab.');
                const newAuthState = JSON.parse(event.newValue);
                dispatch(setAuthFromSync(newAuthState));
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [dispatch]);

    // EFFECT 2: For the initial authentication check
    useEffect(() => {
        
        dispatch(checkAuth());
    }, [dispatch]);

    // EFFECT 3: To fetch initial data for authenticated users
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchNotifications({ page: 1 }));
            dispatch(fetchSettings()); 
        }
    }, [isAuthenticated, dispatch]);
};

function App(): JSX.Element {
    const { isAuthenticated, loading: authLoading } = useAppSelector((state) => state.auth);
    const location = useLocation();
    useAuthEffects();

    // --- LOGIC FOR LAYOUT VISIBILITY ---

    // Routes that should have no sidebars
    const noAppChromeRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email/:token'];
    const showAppChrome = !noAppChromeRoutes.some(route => matchPath(route, location.pathname));

    // Authenticated routes that should have a special, minimal header or no header
    const minimalHeaderRoutes = ['/settings', '/post/:postId', '/settings/:pageName', '/post', '/search', 'profile/:username', 
        '/posts/:postId/thread/:commentId', '/view'
    ]

    const showMainHeader = !minimalHeaderRoutes.some(route => matchPath(route, location.pathname));
    
    // Checks if there is a pending authentication
    const isAuthCheckComplete = authLoading !== 'idle' && authLoading !== 'pending';

    return (
        <>
            <ErrorToast />
            <SuccessToast />
            <ModalManager />
            {/* Pass the correctly calculated variable to the header. */}
            { isAuthCheckComplete && <MobileHeader showHeader={showMainHeader} />}
            
            {showAppChrome && isAuthenticated ? (
                <>
                    <LeftSidebar />
                    <div className={`main-layout ${showMainHeader ? "header-included" : ""}`}>
                        <main className="main-content">
                            <Outlet />
                        </main>
                        {location.pathname !== '/search' && <RightSidebar />}
                    </div>
                </>
            ) : (
                // This renders the simpler layout for auth pages or unauthenticated users.
                <div className="guest-layout header-included">
                    <main className="guest-content">
                        <Outlet />
                    </main>
                </div>
            )}
        </>
    );
}

export default App;