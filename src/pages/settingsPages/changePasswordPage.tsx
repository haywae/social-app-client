import { type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePasswordForm from '../../components/settings/changePasswordForm';
import { LeftArrowIcon } from '../../assets/icons';
import '../../styles/settingsPage.css';

const ChangePasswordPage = (): JSX.Element => {
    const navigate = useNavigate();

    return (
        <div className="settings-page">
            <header className="settings-header">
                <button onClick={() => navigate('/settings/account')} className="close-button">
                    <LeftArrowIcon />
                </button>
                <h1>Change Password</h1>
            </header>
            
            <main className="settings-content">
                <ChangePasswordForm />
            </main>
        </div>
    );
};

export default ChangePasswordPage;