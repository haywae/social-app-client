import { type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangeUsernameForm from '../../components/settings/changeUsernameForm';
import { LeftArrowIcon } from '../../assets/icons';
import '../../styles/settingsPage.css';

const ChangeUsernamePage = (): JSX.Element => {
    const navigate = useNavigate();

    return (
        <div className="settings-page">
            <header className="settings-header">
                <button onClick={() => navigate('/settings/account')} className="close-button">
                    <LeftArrowIcon />
                </button>
                <h1>Change Username</h1>
            </header>
            
            <main className="settings-content">
                <ChangeUsernameForm />
            </main>
        </div>
    );
};

export default ChangeUsernamePage;