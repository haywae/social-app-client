import { useState, type FormEvent, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { deleteAccount } from '../../thunks/settingsThunks/deleteAccountThunk';
import { setError, setSuccess } from '../../slices/ui/uiSlice';
import Modal from './modal';
import CreatePasswordForm from '../settings/createPasswordForm';
import './deleteAccountModal.css';

interface DeleteAccountModalProps {
    onClose: () => void;
    isOpen: boolean;
}

const DeleteAccountModal = ({ onClose, isOpen }: DeleteAccountModalProps): JSX.Element => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: FormEvent) => {
        e.preventDefault();
        setIsDeleting(true);

        try {
            await dispatch(deleteAccount({ password })).unwrap();
            // On success, the authSlice will log the user out.
            // Navigate to the home page after deletion.
            dispatch(setSuccess('Account successfully deleted!'));
            navigate('/');
            
        } catch (err: any) {
            dispatch(setError('Account deletion failed.'));
        } finally {
            setIsDeleting(false);
            onClose();
        }
    };

    const handleCloseModal = () => {
        if (!isDeleting) onClose();
    }

    if (user && user.hasPassword === false) {
        // If the user has no password, don't show the password form.
        return (
            <Modal isOpen={isOpen} onClose={handleCloseModal}>
                <div className='delete-account-modal'>
                    <h2>Create a Password to Continue</h2>
                    <p>To delete your account and perform other sensitive actions, you must first create a password for your WolexChange account.</p>
                    <CreatePasswordForm onSuccess={handleCloseModal}/>
                </div>
            </Modal>
        );
    }
    return (
        <Modal isOpen={isOpen} onClose={handleCloseModal}>
            <div className='delete-account-modal'>
                <h2>Are you absolutely sure?</h2>
                <p>This action is irreversible. All your data will be permanently deleted. Please enter your password to confirm.</p>
                <form onSubmit={handleDelete}>
                    <div className="form-group">
                        <label htmlFor="delete-account-password-confirm">Current Password</label>
                        <input
                            id="delete-account-password-confirm"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isDeleting}
                        />
                    </div>
                    <div className="delete-modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={isDeleting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-danger" disabled={!password || isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete Account'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default DeleteAccountModal;