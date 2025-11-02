import { type JSX } from "react";
import { useMemo } from "react";
import { Link, NavLink, useLocation, matchPath } from "react-router-dom";
import {
    SearchIcon, SettingsIcon, HomeIcon, BankNoteIcon,
    MessageIcon, MessageOpenIcon, CreatePostIcon, NotificationIcon
} from "../../assets/icons";
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
    { path: "/", title: "WolexChange", exact: true },
    { path: "/exchange", title: "Exchange" },
    { path: "/search", title: "Search" },
    { path: "/notifications", title: "Notifications" },
    { path: "/profile/:username", title: "Profile" },
    { path: "/messages", title: "Message" }
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
    return 'Wolexchange';
};


const MobileHeader = ({ showHeader = true }: HeaderProps): JSX.Element | null => {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const { unreadCount } = useAppSelector((state) => state.notifications);
    const { conversations } = useAppSelector((state) => state.conversations);

    const location = useLocation();


    const pageTitle = getPageTitle(location.pathname);
    const totalUnreadMessages = useMemo(() => {
        return conversations.reduce((total, convo) => total + (convo.unreadCount || 0), 0);
    }, [conversations]);

    if (!isAuthenticated) {
        return (
            <header className="main-header-no-auth">
                <div className="header-content-no-auth">
                    <Link to="/" className="header-logo">WolexChange</Link>
                </div>
            </header>
        );
    }

    return (
        <>
            {showHeader && (
                <header className="main-header">
                    <div className="header-content">
                        <div className="header-actions">
                            <NavLink to={`/messages`} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                                <div className="nav-icon-wrapper">
                                    {totalUnreadMessages > 0 ? <MessageIcon /> : <MessageOpenIcon />}
                                    {totalUnreadMessages > 0 && (
                                        <span className="notification-indicator">{totalUnreadMessages}</span>
                                    )}
                                </div>
                            </NavLink>
                        </div>
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
                <NavLink to="/exchange" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                    <div className="nav-icon-wrapper">
                        <BankNoteIcon />
                    </div>
                </NavLink>
                <NavLink to="/search" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                    <div className="nav-icon-wrapper">
                        <SearchIcon />
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