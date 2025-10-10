import { useState, type FormEvent, type JSX } from 'react';
import { useAppDispatch } from '../../utils/hooks';
import { requestEmailChange } from '../../thunks/settingsThunks/requestEmailChangeThunk';
import { setError, setSuccess } from '../../slices/ui/uiSlice';


const ChangeEmailForm = (): JSX.Element => {
    const dispatch = useAppDispatch();
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

    return (
        <form onSubmit={handleSubmit} className="settings-form-section">
            <h3>Change Email Address</h3>
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