import { useEffect, type JSX, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../utils/hooks';
import { fetchUserProfile } from '../thunks/userThunks/fetchUserProfile';
import { followUser } from '../thunks/userThunks/followUserThunk';
import { fetchUserExchangeData } from '../thunks/exchangeThunks/fetchUserExchangeDataThunk';
import { clearProfile } from '../slices/user/userProfileSlice';
import { openModal } from '../slices/ui/uiSlice';
import PostFeed from '../components/posts/postFeed';
import LiveRatesDisplay from '../components/userProfile/liveRatesTab';
import { DEFAULT_AVATAR_URL } from '../appConfig';
import { CalendarIcon } from '../assets/icons';
import PageHeader from '../components/layout/pageHeader';
import '../styles/userProfilePage.css';


// A utility to format the joined date
const formatJoinedDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
    });
};

type ProfileTab = 'posts' | 'liveRates'; // The possible tabs

/**
 * Renders a user's profile page, including their bio, stats, and a feed of their posts.
 */
const UserProfilePage = (): JSX.Element => {

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { username } = useParams<{ username: string }>();

    /* States from the profile and auth slice */
    const { profile, loading: profileLoading, error, exchangeData, exchangeLoading, exchangeError } = useAppSelector((state) => state.profile);
    const { user: loggedInUser, loading: authLoading } = useAppSelector((state) => state.auth);

    /* Local loading state specifically for the follow button */
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<ProfileTab>('posts');

    const isMyProfile = loggedInUser?.username === profile?.username;

    /* --- EFFECT 1: Fetches the profile data when the component mounts or the username changes. */
    useEffect(() => {
        if (username) {
            dispatch(fetchUserProfile(username));
            dispatch(fetchUserExchangeData(username));
        }

        /* Cleanup: Clear the profile data when the component unmounts */
        return () => {
            dispatch(clearProfile());
        };
    }, [username, dispatch]);

    const handleAvatarClick = () => {
        if (!profile) return;
        dispatch(openModal({
            modalType: 'VIEW_AVATAR',
            modalProps: {
                src: profile.avatarUrl || DEFAULT_AVATAR_URL,
                alt: `${profile.displayName}'s avatar - large view`
            }
        }));
    };


    /** Activates the follow handler */
    const handleFollow = () => {
        if (!loggedInUser) {
            navigate('/login');
            return;
        }

        if (profile) {
            setIsFollowLoading(true);
            dispatch(followUser({
                username: profile.username,
                isFollowing: profile.isFollowing
            })).finally(() => {
                setIsFollowLoading(false);
            });
        }
    };

    /**  A dedicated function for rendering the action button */
    const renderActionButton = () => {
        if (isMyProfile) {
            // --- The profile owner sees an "Edit Profile" button ---
            return <button className="edit-profile-button" onClick={() => navigate('/settings/profile')}>Edit Profile</button>;
        }
        // --- A logged-in user viewing another profile sees the dynamic Follow/Following button ---
        return (
            <button
                onClick={handleFollow}
                disabled={isFollowLoading}
                className={`follow-button ${profile?.isFollowing ? 'following' : ''}`}
            >
                {isFollowLoading ? '...' : (profile?.isFollowing ? 'Following' : 'Follow')}
            </button>
        );
    };

    const isLoading = authLoading === 'pending' || authLoading === 'idle' || profileLoading === 'pending' || profileLoading === 'idle';

    if (isLoading) {
        return (
            <div className="profile-page-container">
                <p className="profile-message">Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return <p className="profile-message">The requested profile could not be loaded.</p>;
    }

    if (!profile) {
        return <p className="profile-message">User profile not found.</p>;
    }
    return (
        <>
            <title>{`${profile.username} - WolexChange`}</title>
            <div className="profile-page-container">
                {loggedInUser && <PageHeader
                    title={isMyProfile ? 'Profile' : profile.displayName}
                    showBackButton={!isMyProfile}
                />}
                <header className="profile-header">
                    <div className="profile-main-info">
                        <div className="profile-avatar-container">
                            <img src={profile.avatarUrl || DEFAULT_AVATAR_URL}
                                alt={`${profile.displayName}'s avatar`}
                                onClick={handleAvatarClick}
                                className="user-avatar avatar-lg clickable"
                            />
                        </div>
                        <div className="profile-stats-and-actions">
                            <div className="profile-stats">
                                <div className="stat"><strong>{profile.postCount}</strong> Posts</div>
                                <div className="stat"><strong>{profile.followerCount}</strong> Followers</div>
                                <div className="stat"><strong>{profile.followingCount}</strong> Following</div>
                            </div>
                            <div className="profile-actions">
                                {renderActionButton()}
                            </div>
                        </div>
                    </div>

                    <div className="profile-bio-info">
                        <h2 className="profile-display-name">{profile.displayName}</h2>
                        <p className="profile-username">@{profile.username}</p>
                        <p className="profile-bio">{profile.bio}</p>
                        <p className="profile-joined-date">
                            <CalendarIcon />
                            <span>Joined {formatJoinedDate(profile.joinedDate)}</span>
                        </p>
                    </div>
                </header>

                <div className="profile-tabs">
                    <button
                        className={`profile-tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('posts')}
                    >
                        Posts
                    </button>
                    <button
                        className={`profile-tab-button ${activeTab === 'liveRates' ? 'active' : ''}`}
                        onClick={() => setActiveTab('liveRates')}
                    >
                        Live Rates
                    </button>
                </div>

                <div className="profile-content">
                    {activeTab === 'posts' && <PostFeed username={profile.username} />}
                    {activeTab === 'liveRates' && (
                        <>
                            {exchangeLoading === 'pending' && <p className="profile-message">Loading rates...</p>}
                            {exchangeError && <p className="profile-message error">Exchange Rates could not be loaded</p>}
                            {exchangeLoading === 'succeeded' && exchangeData && (
                                <LiveRatesDisplay exchangeData={exchangeData} />
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserProfilePage;
