/* -----------------------------------------------------------------------------
Description: The main page component for user settings.
-----------------------------------------------------------------------------
*/
import { type JSX } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../utils/hooks';
import { logoutUser } from "../../thunks/authThunks/logoutThunk";
import withAuth from '../../components/common/withAuth';
import { LeftArrowIcon } from '../../assets/icons';
import '../../styles/settingsPage.css';


// Reusable component for each clickable settings card
const SettingsCard = ({ title, description, to }: { title: string, description: string, to: string }) => (
    <Link to={to} className="settings-card">
        <div className="card-info">
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
        <span className="card-arrow">&gt;</span>
    </Link>
);

const SettingsPage = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/');
    };

    return (
        <div className="settings-page">
            <header className="settings-header">
                <button onClick={() => navigate('/')} className="close-button"><LeftArrowIcon /></button>
                <h1>Settings</h1>
            </header>
            <main className="settings-menu">
                <SettingsCard
                    title="Edit Profile"
                    description="Set your display name, bio, and profile picture"
                    to="/settings/profile"
                />
                <SettingsCard
                    title="Account Management"
                    description="Change username, password, and email address"
                    to="/settings/account"
                />
                {/* <SettingsCard
                    title="Preferences"
                    description="Country, language, and post visibility"
                    to="/settings/preferences"
                />
                <SettingsCard
                    title="Notification Settings"
                    description="Mute notifications, manage email alerts"
                    to="/settings/notifications"
                /> */}
                <SettingsCard
                    title="Security and Privacy"
                    description="Blocked users, delete account"
                    to="/settings/security"
                />

                <p>
                    <button className="settings-link-button" onClick={handleLogout}>
                        <span>Logout</span> 
                        <span className="card-arrow">&gt;</span>
                    </button>
                </p>
            </main>
        </div>
    );
};

export default withAuth(SettingsPage);