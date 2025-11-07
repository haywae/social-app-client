import { type JSX } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '../../utils/hooks';
import { openModal } from '../../slices/ui/uiSlice';

import { LeftArrowIcon } from '../../assets/icons';
import '../../styles/settingsPage.css';

const SecurityPrivacyPage = (): JSX.Element => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleOpenDeleteModal = () => {
        dispatch(openModal({ modalType: 'CONFIRM_DELETE_ACCOUNT' }));
    };

    return (
        <div className="settings-page">
            <header className="settings-header">
                <button onClick={() => navigate('/settings')} className="close-button"><LeftArrowIcon /></button>
                <h1>Security and Privacy</h1>
            </header>
            <main className="settings-content">
                <div className="settings-form-section">
                    <h3>Delete Account</h3>
                    <p className="section-description">
                        Permanently delete your account and all of its content. This action cannot be undone.
                    </p>
                    <div className="settings-form-footer">
                        <button className="btn-danger" onClick={handleOpenDeleteModal}>
                            Delete your account
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SecurityPrivacyPage;