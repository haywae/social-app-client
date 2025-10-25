import { type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePasswordForm from '../../components/settings/changePasswordForm';
import { LeftArrowIcon } from '../../assets/icons';
import '../../styles/settingsPage.css'; // Can reuse the same page styles

const ChangePasswordPage = (): JSX.Element => {
    const navigate = useNavigate();

    return (
        <div className="settings-page">
            <header className="settings-header">
                {/* This button now goes back to the Account menu */}
                <button onClick={() => navigate('/settings/account')} className="close-button">
                    <LeftArrowIcon />
                </button>
                <h1>Change Password</h1>
            </header>
            
            <main className="settings-content">
                {/* This page does one thing: shows the username form */}
                <ChangePasswordForm />
            </main>
        </div>
    );
};

export default ChangePasswordPage;