import { type JSX } from "react";
import { Link, NavLink, useLocation, matchPath } from "react-router-dom";
import { SettingsIcon, HomeIcon, CreatePostIcon, NotificationIcon, InfoIcon } from "../../assets/icons";
import { useAppSelector } from "../../utils/hooks";
import { DEFAULT_AVATAR_URL, IMAGE_BASE_URL } from "../../appConfig";
import "./mobileHeader.css";

interface HeaderProps {
    showHeader?: boolean;
}

// Define the style for active links in one place
const activeLinkStyle = { color: 'var(--base)', fontWeight: '700' };

// Config for page titles that supports dynamic paths
const routeConfig = [
    { path: "/", title: "Ayo's Social App", exact: true },
    { path: "/notifications", title: "Notifications" },
    { path: "/profile/:username", title: "Profile" },
];

/** A helper function to find the correct title using matchPath 
 * @param pathname The path name
 * @returns The Tile of the page 
*/
const getPageTitle = (pathname: string): string => {
    for (const route of routeConfig) {
        // The `end` option in matchPath is equivalent to an `exact` prop
        const match = matchPath({ path: route.path, end: route.exact || false }, pathname);
        if (match) {
            return route.title;
        }
    }
    return "Ayo's Social App";
};


const MobileHeader = ({ showHeader = true }: HeaderProps): JSX.Element | null => {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const { unreadCount } = useAppSelector((state) => state.notifications);

    const location = useLocation();
    const pageTitle = getPageTitle(location.pathname);

    if (!isAuthenticated) {
        return (
            <header className="main-header-no-auth">
                <div className="header-content-no-auth">
                    <Link to="/" className="header-logo">Ayo's Social App</Link>
                </div>
            </header>
        );
    }

    return (
        <>
            {showHeader && (
                <header className="main-header">
                    <div className="header-content">
                        <h1 className="header-title">{pageTitle}</h1>
                        <div className="header-actions">
                            <NavLink to="/settings" title="Settings Icon">
                                <div className="nav-icon-wrapper">
                                    <SettingsIcon />
                                </div>
                            </NavLink>
                        </div>
                    </div>
                </header>
            )}

            <nav className="bottom-nav">
                <NavLink to="/feed" style={({ isActive }) => isActive ? activeLinkStyle : undefined} end>
                    <div className="nav-icon-wrapper">
                        <HomeIcon />
                    </div>
                </NavLink>
                <NavLink to="/info" style={({ isActive }) => isActive ? activeLinkStyle : undefined} end>
                    <div className="nav-icon-wrapper">
                        <InfoIcon />
                    </div>
                </NavLink>
                <NavLink to="/post" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                    <div className="nav-icon-wrapper">
                        <CreatePostIcon />
                    </div>
                </NavLink>
                <NavLink to="/notifications" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                    <div className="nav-icon-wrapper">
                        <NotificationIcon />
                        {/* Conditionally render the indicator */}
                        {unreadCount > 0 && (
                            <span className="notification-indicator">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                </NavLink>
                <NavLink
                    to={`/profile/${user?.username}`}
                    style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                >
                    <div className="nav-icon-wrapper">
                        <img src={user?.profilePictureUrl ? `${IMAGE_BASE_URL}/${user.profilePictureUrl}` : DEFAULT_AVATAR_URL} className="user-avatar avatar-xs" alt="User avatar" />
                    </div>
                </NavLink>
            </nav>
        </>
    );
};

export default MobileHeader;