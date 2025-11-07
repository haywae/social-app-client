/* -----------------------------------------------------------------------------
Description: The main page component for user settings.
-----------------------------------------------------------------------------
*/
import { type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../utils/hooks';
import { logoutUser } from "../../thunks/authThunks/logoutThunk";
import { LeftArrowIcon } from '../../assets/icons';
import SettingsCard from '../../components/layout/settingsCard';
import AuthFooter from '../../components/layout/authFooter';
import '../../styles/settingsPage.css';

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
            <AuthFooter />
        </div>
    );
};

export default SettingsPage;