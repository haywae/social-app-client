import { useEffect, type JSX } from "react";
import { Outlet, useLocation, matchPath } from "react-router-dom";
import { fetchSettings } from "./thunks/settingsThunks/fetchSettingsThunk";
import { fetchNotifications } from "./thunks/notificationThunks/notificationListThunk";
import { useAppSelector, useAppDispatch } from "./utils/hooks";
import MobileHeader from "./components/layout/mobileHeader";
import RightSidebar from "./components/layout/rightSidebar";
import LeftSidebar from "./components/layout/leftSidebar";
import { OnboardingCheck } from "./components/auth/onBoardingCheck";
import { connectSocket, disconnectSocket } from "./services/socketService";
import "./styles/App.css";
import { DEVELOPER_MODE } from "./appConfig";
import { fetchConversations } from "./thunks/messaging/fetchConversationsThunk";

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
            dispatch(fetchConversations());
        }
    }, [isAuthenticated, dispatch]);
};

function App(): JSX.Element {
    const location = useLocation();
    useAuthenticatedData();

    // --- Add Socket Connection Logic ---
    const { isAuthenticated, hasInitializedAuth } = useAppSelector((state) => state.auth);

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
        '/post', '/search', 'profile/:username',
        '/posts/:postId/thread/:commentId', '/view',
    ];

    const showMainHeader = !minimalHeaderRoutes.some(route => matchPath(route, location.pathname));

    const hideRightSidebarRoutes = [
        '/search', '/messages', '/messages/:public_id'
    ];

    const showRightSidebar = !hideRightSidebarRoutes.some(route => matchPath(route, location.pathname));


    return (
        <>
            <MobileHeader showHeader={showMainHeader} />
            <LeftSidebar />
            <div className={`main-layout ${showMainHeader ? "header-included" : ""}`}>
                <main className={`main-content ${!showRightSidebar ? "expand-main-content" : ""}`}>
                    <OnboardingCheck>
                        <Outlet />
                    </OnboardingCheck>
                </main>
                {showRightSidebar && <RightSidebar />}
            </div>
        </>
    );
}

export default App;

