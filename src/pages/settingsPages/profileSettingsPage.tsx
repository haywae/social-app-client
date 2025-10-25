import { useState, type JSX, type FormEvent, type ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { updateSettings } from '../../thunks/settingsThunks/updateSettingsThunk';
import { uploadProfilePicture } from '../../thunks/settingsThunks/uploadProfilePictureThunk';
import { fetchSettings } from '../../thunks/settingsThunks/fetchSettingsThunk';
import { clearSettingsError } from '../../slices/settings/settingsSlice';
import { DEFAULT_AVATAR_URL, IMAGE_BASE_URL } from '../../appConfig';
import { LeftArrowIcon } from '../../assets/icons';
import { setError } from '../../slices/ui/uiSlice';
import '../../styles/profileSettingsPage.css'; 

const ProfileSettingsPage = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    // Get the loading and error states as well
    const { settings, loading, error: globalError } = useAppSelector((state) => state.settings);
    const { user } = useAppSelector((state) => state.auth);
    
    // Initialize state with empty strings
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState(DEFAULT_AVATAR_URL);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false); // 

    useEffect(() => {
        if (!settings && loading !== 'pending') {
            dispatch(fetchSettings());
        }
    }, [dispatch, settings, loading]);

    // This effect syncs the local form state AFTER the settings have been loaded.
    useEffect(() => {
        if (settings) {
            setDisplayName(settings.displayName || '');
            setBio(settings.bio || '');
            if (!imageFile) {
                setImagePreview(settings.avatarUrl ? `${IMAGE_BASE_URL}/${settings.avatarUrl}` : DEFAULT_AVATAR_URL);
            }
        }
        dispatch(clearSettingsError());
    }, [settings, imageFile]);

    useEffect(() => {
    // This is the cleanup function that will run when the component unmounts
    // or when the imagePreview state changes.
    return () => {
        // We check if the preview URL is an object URL, not a regular http URL
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
    };
}, [imagePreview]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Start with the existing URL from the settings state.
            let finalImageUrl = settings?.avatarUrl || '';

            if (imageFile) {
                setIsUploading(true); // Start image upload indicator
                const uploadPayload = await dispatch(uploadProfilePicture(imageFile)).unwrap();
                finalImageUrl = uploadPayload.profilePictureUrl;
                setIsUploading(false); // End image upload indicator
            }
            
            const settingsData = {
                displayName: displayName,
                bio: bio,
                avataUrl: finalImageUrl,
            };

            await dispatch(updateSettings({ settingsData })).unwrap();
            navigate(`/profile/${user?.username}`);

        } catch (err: any) {
            dispatch(setError(err.message || err || 'An unexpected error occurred.'));
        } finally {
            setIsUploading(false);
            setIsSubmitting(false);
        }
    };

    // #2: A loading state to prevent showing an empty form.
    if (loading === 'pending' || loading === 'idle') {
        return (
             <div className="settings-page">
                <header className="settings-header">
                    <button onClick={() => navigate('/settings')} className="close-button">Back</button>
                    <h1>Edit Profile</h1>
                </header>
                <div className="settings-message">Loading settings...</div>
             </div>
        );
    }

    // Handle fetch error
    if (globalError) {
         return (
             <div className="settings-page">
                <header className="settings-header">
                    <button onClick={() => navigate('/settings')} className="close-button">Back</button>
                    <h1>Edit Profile</h1>
                </header>
                <div className="settings-message error">{globalError}</div>
             </div>
        );
    }

    return (
        <div className="settings-page">
            <header className="settings-header">
                <button onClick={() => navigate(`/settings`)} className="close-button"><LeftArrowIcon /></button>
                <h1>Edit Profile</h1>
            </header>
            <main>
                <form onSubmit={handleSubmit} className="settings-form">
                    <div className="profile-picture-uploader">
                        <div className="image-preview-wrapper">
                            <img src={imagePreview} alt="Profile preview" className="user-avatar avatar-xl" />
                            {isUploading && <div className="image-upload-spinner"></div>}
                        </div>
                        <label htmlFor="profile-picture-input" className="btn btn-secondary">
                            Change Photo
                        </label>
                        <input id="profile-picture-input" type="file" accept="image/png, image/jpeg, image/gif" onChange={handleImageChange} />
                    </div>
                    
                    <div className="settings-form-group">
                        <label htmlFor="display_name">Display Name</label>
                        <input type="text" id="display_name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                    </div>
                    <div className="settings-form-group">
                        <label htmlFor="bio">Bio</label>
                        <textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
                    </div>
                    
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default ProfileSettingsPage;