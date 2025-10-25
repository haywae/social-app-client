import { useState, type FormEvent, type JSX } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { updatePassword } from '../../thunks/settingsThunks/updatePasswordThunk';
import { setError, setSuccess } from '../../slices/ui/uiSlice';
import CreatePasswordForm from './createPasswordForm';

const ChangePasswordForm = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [old_password, setOldPassword] = useState('');
    const [new_password, setNewPassword] = useState('');
    const [confirm_password, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Client-side validation remains the same
        if (new_password !== confirm_password) {
            dispatch(setError('New passwords do not match.'));
            return;
        }

        setLoading(true);
        try {
            // This will automatically throw an error if the thunk is rejected
            await dispatch(updatePassword({ old_password, new_password })).unwrap();

            // This code now only runs on success
            dispatch(setSuccess('Password successfully updated!'));
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (err: any) {
            // The 'err' variable contains the payload from rejectWithValue
            dispatch(setError(err));
        } finally {
            // The finally block runs regardless of success or failure
            setLoading(false);
        }
    };

    if (user && user.hasPassword === false) {
        // If the user has no password, don't show the password form.
        return (
            <div className='settings-form-section'>
                <h3>Create a Password to Continue</h3>
                <p>To change your password and perform other sensitive actions, you must first create a password for your WolexChange account.</p>
                <CreatePasswordForm />
            </div>
        );
    }
    return (
        <form onSubmit={handleSubmit} className="settings-form-section">
            <div className="settings-form-group">
                <label htmlFor="old_password">Current Password</label>
                <input type="password" id="old_password" value={old_password} onChange={(e) => setOldPassword(e.target.value)} required />
            </div>
            <div className="settings-form-group">
                <label htmlFor="new_password">New Password</label>
                <input type="password" id="new_password" value={new_password} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="settings-form-group">
                <label htmlFor="confirm_password">Confirm New Password</label>
                <input type="password" id="confirm_password" value={confirm_password} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <div className="settings-form-footer">
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
};

export default ChangePasswordForm;