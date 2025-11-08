import { useEffect, type JSX } from "react";
import { Outlet, useLocation, matchPath } from "react-router-dom";
import { fetchSettings } from "./thunks/settingsThunks/fetchSettingsThunk";
import { fetchNotifications } from "./thunks/notificationThunks/notificationListThunk";
import { useAppSelector, useAppDispatch } from "./utils/hooks";
import MobileHeader from "./components/layout/mobileHeader";
import RightSidebar from "./components/layout/rightSidebar";
import LeftSidebar from "./components/layout/leftSidebar";
import { connectSocket, disconnectSocket, getSocket } from "./services/socketService";
import "./styles/App.css";
import { DEVELOPER_MODE } from "./appConfig";
import { checkAuth } from "./thunks/authThunks/authCheckThunk";

/** * This custom hook now only fetches data for an already authenticated user.
 * The initial auth check is handled at a higher level in RootLayout.
 */
const useAuthenticatedData = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchNotifications({ page: 1 }));
            dispatch(fetchSettings());
        }
    }, [isAuthenticated, dispatch]);
};

function App(): JSX.Element {
    const location = useLocation();
    const dispatch = useAppDispatch();
    useAuthenticatedData();

    // --- Add Socket Connection Logic ---
    const { isAuthenticated, hasInitializedAuth, loading, error } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // This function will run when the tab becomes visible again
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const socket = getSocket(); // Get the current socket instance
                // Condition 1: The socket is disconnected (your original logic)
                const socketIsDead = socket && !socket.connected;

                // Condition 2: We are in the "offline" error state from Scenario A
                // (Authenticated, but the last check failed with a network error)
                const authIsInErrorState = isAuthenticated && loading === 'failed' && error;

                // If either condition is true, we must run checkAuth
                if (socketIsDead || authIsInErrorState) {
                    DEVELOPER_MODE && console.log("Tab visible and auth needs check, running auth check...");
                    dispatch(checkAuth());
                }
            }
        };

        // Add the event listener
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Clean up the listener
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [dispatch]); // Empty array means this runs once on mount

    useEffect(() => {
        // --- 1. Connect socket When user is authenticated AND has a token ---
        if (isAuthenticated && hasInitializedAuth) {
            DEVELOPER_MODE && console.log("Auth is valid, connecting socket...")
            connectSocket();
        } else {
            DEVELOPER_MODE && console.log("No valid auth, ensuring socket is disconnected.")
        }

        // --- 2. Cleanup function: Disconnect socket when component unmounts ---
        return () => {
            DEVELOPER_MODE && console.log("Disconnecting socket from App.tsx...")
            disconnectSocket();
        };
    }, [isAuthenticated, hasInitializedAuth]);

    // --- LOGIC FOR LAYOUT VISIBILITY ---
    const minimalHeaderRoutes = [
        '/settings', '/post/:postId', '/settings/:pageName', 'settings/:pageName/:subpageName',
        '/post', 'profile/:username',
    ];

    const showMainHeader = !minimalHeaderRoutes.some(route => matchPath(route, location.pathname));

    const hideRightSidebarRoutes = [
        '/info'
    ];

    const showRightSidebar = !hideRightSidebarRoutes.some(route => matchPath(route, location.pathname));


    return (
        <>
            <MobileHeader showHeader={showMainHeader} />
            <LeftSidebar />
            <div className={`main-layout ${showMainHeader ? "header-included" : ""}`}>
                <main className={`main-content ${!showRightSidebar ? "expand-main-content" : ""}`}>
                    <Outlet />
                </main>
                {showRightSidebar && <RightSidebar />}
            </div>
        </>
    );
}

export default App;

