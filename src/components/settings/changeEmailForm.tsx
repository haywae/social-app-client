import { useState, type FormEvent, type JSX } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { requestEmailChange } from '../../thunks/settingsThunks/requestEmailChangeThunk';
import { setError, setSuccess } from '../../slices/ui/uiSlice';
import CreatePasswordForm from './createPasswordForm';


const ChangeEmailForm = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [new_email, setNewEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const result = await dispatch(requestEmailChange({ new_email, password }));

        if (requestEmailChange.fulfilled.match(result)) {
            dispatch(setSuccess('Verification sent! Check your new email address to confirm the change.'));
            setNewEmail('');
            setPassword('');
        } else {
            dispatch(setError(result.payload || 'An error occurred.'));
        }
        setLoading(false);
    };

    if (user && user.hasPassword === false) {
        // If the user has no password, don't show the password form.
        return (
            <div className='settings-form-section'>
                <h3>Create a Password to Continue</h3>
                <p>To change your email and perform other sensitive actions, you must first create a password for your WolexChange account.</p>
                <CreatePasswordForm />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="settings-form-section">
            <div className="settings-form-group">
                <label htmlFor="new_email">New Email Address</label>
                <input type="email" id="new_email" value={new_email} onChange={(e) => setNewEmail(e.target.value)} required />
            </div>
            <div className="settings-form-group">
                <label htmlFor="password-for-email">Current Password</label>
                <input type="password" id="password-for-email" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="settings-form-footer">
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Sending Verification...' : 'Send Verification'}
                </button>
            </div>
        </form>
    );
};

export default ChangeEmailForm;