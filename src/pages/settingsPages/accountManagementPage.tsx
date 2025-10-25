import { type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsCard from '../../components/layout/settingsCard';
import ResendVerification from '../../components/settings/resendVerification';
import { LeftArrowIcon } from '../../assets/icons';
import { useAppSelector } from '../../utils/hooks';
import '../../styles/accountManagementPage.css';


const AccountManagementPage = (): JSX.Element => {
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);

    return (
        <div className="settings-page">
            <header className="settings-header">
                <button onClick={() => navigate('/settings')} className="close-button"><LeftArrowIcon /></button>
                <h1>Account Management</h1>
            </header>

            <main className="settings-content">
                <SettingsCard
                    title="Change Username"
                    description="Update your unique @username"
                    to="/settings/account/username"
                />
                <SettingsCard
                    title="Change Password"
                    description="Set a new password for your account"
                    to="/settings/account/password"
                />
                <SettingsCard
                    title="Change Email"
                    description="Update the email address for your account"
                    to="/settings/account/email"
                />
                {user && !user.isEmailVerified && (
                    <ResendVerification />
                )}
            </main>
        </div>
    );
};

export default AccountManagementPage;