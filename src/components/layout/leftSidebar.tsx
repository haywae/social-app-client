import { type JSX } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { SearchIcon, NotificationIcon, ProfileIcon, HomeIcon, BankNoteIcon, CreatePostIcon, SignoutIcon, SettingsIcon } from "../../assets/icons";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import { logoutUser } from "../../thunks/authThunks/logoutThunk";
import { DEFAULT_AVATAR_URL } from "../../appConfig";

import "./leftSidebar.css";

/**
 * Renders the main navigation sidebar for authenticated users on desktop screens.
 */
const LeftSidebar = (): JSX.Element => {
    const { user } = useAppSelector((state) => state.auth);
    const { unreadCount } = useAppSelector((state) => state.notifications);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const activeLinkStyle = {
        color: 'var(--base)',
        fontWeight: '700',
    };

    const handleLogout = async() => {
        await dispatch(logoutUser());
        navigate('/'); // Redirect to home after logout
    };

    return (
        <aside className="left-sidebar">
            <div className="sidebar-content">
                <Link to="/" className="sidebar-logo">
                    WolexChange
                </Link>

                {/* --- SECTION 1: Main Navigation --- */}
                <nav className="sidebar-nav">
                    <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} end>
                        <HomeIcon />
                        <span>Home</span>
                    </NavLink>
                    <NavLink to="/exchange" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                        <BankNoteIcon />
                        <span>Exchange</span>
                    </NavLink>
                    <NavLink to="/search" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                        <SearchIcon />
                        <span>Search</span>
                    </NavLink>
                    <NavLink to="/post" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                        <CreatePostIcon />
                        <span>Create Post</span>
                    </NavLink>
                </nav>

                {/* --- SECTION 2: User Profile and Actions (pushed to the bottom) --- */}
                <div className="sidebar-footer">
                    <nav className="sidebar-nav">
                        <NavLink to="/notifications" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                            <div className="nav-icon-wrapper">
                                <NotificationIcon />
                                {unreadCount > 0 && (
                                    <span className="notification-indicator">{unreadCount}</span>
                                )}
                            </div>
                            <span>Notifications</span>
                        </NavLink>
                        <NavLink to={`/profile/${user?.username}`} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                            <ProfileIcon />
                            <span>Profile</span>
                        </NavLink>
                        <NavLink to="/settings" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                            <SettingsIcon />
                            <span>Settings</span>
                        </NavLink>
                    </nav>

                    <div className="sidebar-user-actions">
                        <Link to={`/profile/${user?.username}`} className="sidebar-profile-link">
                            <img src={user?.profilePictureUrl || DEFAULT_AVATAR_URL} alt="User avatar" className="user-avatar avatar-sm" />
                            <div className="sidebar-profile-info">
                                <span>{user?.displayName}</span>
                                <small>@{user?.username}</small>
                            </div>
                        </Link>
                        <button className="sidebar-logout-button" onClick={handleLogout} title="Logout">
                            <SignoutIcon />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default LeftSidebar;