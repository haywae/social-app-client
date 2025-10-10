import { useState, type FormEvent, type JSX } from 'react';
import { useAppDispatch } from '../../utils/hooks';
import { updateUsername } from '../../thunks/settingsThunks/updateUsernameThunk';
import { setError, setSuccess } from '../../slices/ui/uiSlice';


const ChangeUsernameForm = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const [new_username, setNewUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await dispatch(updateUsername({ new_username, password }));

        if (updateUsername.fulfilled.match(result)) {
            dispatch(setSuccess('Username successfully updated!'));
            setNewUsername(''); 
            setPassword('');
        } else {
            dispatch(setError(result.payload || 'An error occurred.'));
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="settings-form-section">
            <h3>Change Username</h3>
            <div className="settings-form-group">
                <label htmlFor="new_username">New Username</label>
                <input type="text" id="new_username" value={new_username} onChange={(e) => setNewUsername(e.target.value)} required />
            </div>
            <div className="settings-form-group">
                <label htmlFor="password-for-username">Current Password</label>
                <input type="password" id="password-for-username" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="settings-form-footer">
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
};
export default ChangeUsernameForm;