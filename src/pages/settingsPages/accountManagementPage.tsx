import { type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import withAuth from '../../components/common/withAuth';
import ChangeUsernameForm from '../../components/settings/changeUsernameForm';
import ChangePasswordForm from '../../components/settings/changePasswordForm';
import ChangeEmailForm from '../../components/settings/changeEmailForm';
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
                <ChangeUsernameForm />
                <ChangePasswordForm />
                <ChangeEmailForm />
                {user && !user.isEmailVerified && (
                    <ResendVerification />
                )}
            </main>
        </div>
    );
};

export default withAuth(AccountManagementPage);