import { useState, type FormEvent, type JSX } from 'react';
import { useAppDispatch } from '../../utils/hooks';
import { setError, setSuccess } from '../../slices/ui/uiSlice';
import { createPassword } from '../../thunks/settingsThunks/createPasswordThunk';

/**
 * Props for the CreatePasswordForm component.
 */
interface CreatePasswordFormProps {
    /** Optional: A callback function to run on successful password creation.
     * This is typically used to close the modal this form resides in.
     */
    onSuccess?: () => void;
}

/**
 * A form for OAuth-only users to create their first password.
 */
const CreatePasswordForm = ({ onSuccess }: CreatePasswordFormProps): JSX.Element => {
    const dispatch = useAppDispatch();
    const [new_password, setNewPassword] = useState('');
    const [confirm_password, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Client-side validation
        if (new_password !== confirm_password) {
            dispatch(setError('Passwords do not match.'));
            return;
        }

        // Optional: Add a simple strength check
        if (new_password.length < 8) {
            dispatch(setError('Password must be at least 8 characters long.'));
            return;
        }

        setLoading(true);
        try {
            // Dispatch the new createPassword thunk
            // .unwrap() will throw an error if the thunk is rejected
            await dispatch(createPassword({ new_password })).unwrap();
            
            // This code only runs on success
            dispatch(setSuccess('Password created successfully! You can now use it for sensitive actions.'));
            setNewPassword('');
            setConfirmPassword('');

            if (onSuccess) {
                onSuccess();
            }

        } catch (err: any) {
            // The 'err' variable contains the payload from rejectWithValue
            dispatch(setError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="settings-form-section">
            <div className="settings-form-group">
                <label htmlFor="new_password">New Password</label>
                <input 
                    type="password" 
                    id="new_password" 
                    value={new_password} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                    minLength={8}
                />
            </div>
            <div className="settings-form-group">
                <label htmlFor="confirm_password">Confirm New Password</label>
                <input 
                    type="password" 
                    id="confirm_password" 
                    value={confirm_password} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    minLength={8}
                />
            </div>
            <div className="settings-form-footer">
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Create Password'}
                </button>
            </div>
        </form>
    );
};

export default CreatePasswordForm;
