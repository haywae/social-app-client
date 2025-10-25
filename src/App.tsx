import { useEffect, type JSX } from "react";
import { Outlet, useLocation, matchPath } from "react-router-dom";
import { fetchSettings } from "./thunks/settingsThunks/fetchSettingsThunk";
import { fetchNotifications } from "./thunks/notificationThunks/notificationListThunk";
import { useAppSelector, useAppDispatch } from "./utils/hooks";
import MobileHeader from "./components/layout/mobileHeader";
import RightSidebar from "./components/layout/rightSidebar";
import LeftSidebar from "./components/layout/leftSidebar";
import { OnboardingCheck } from "./components/auth/onBoardingCheck";
import "./styles/App.css";

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
    useAuthenticatedData();

    // --- LOGIC FOR LAYOUT VISIBILITY ---
    const minimalHeaderRoutes = ['/settings', '/post/:postId', '/settings/:pageName', '/post', '/search', 'profile/:username',
        '/posts/:postId/thread/:commentId', '/view'
    ];

    const showMainHeader = !minimalHeaderRoutes.some(route => matchPath(route, location.pathname));

    return (
        <>
            <MobileHeader showHeader={showMainHeader} />
            <LeftSidebar />
            <div className={`main-layout ${showMainHeader ? "header-included" : ""}`}>
                <main className="main-content">
                    <OnboardingCheck>
                        <Outlet />
                    </OnboardingCheck>
                </main>
                {location.pathname !== '/search' && <RightSidebar />}
            </div>
        </>
    );
}

export default App;

