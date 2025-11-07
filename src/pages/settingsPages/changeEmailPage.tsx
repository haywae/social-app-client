import { type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangeEmailForm from '../../components/settings/changeEmailForm';
import { LeftArrowIcon } from '../../assets/icons';
import '../../styles/settingsPage.css'; // Can reuse the same page styles

const ChangeEmailPage = (): JSX.Element => {
    const navigate = useNavigate();

    return (
        <div className="settings-page">
            <header className="settings-header">
                {/* This button now goes back to the Account menu */}
                <button onClick={() => navigate('/settings/account')} className="close-button">
                    <LeftArrowIcon />
                </button>
                <h1>Change Email</h1>
            </header>
            
            <main className="settings-content">
                <ChangeEmailForm />
            </main>
        </div>
    );
};

export default ChangeEmailPage;