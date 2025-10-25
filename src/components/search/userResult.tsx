import { useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../utils/hooks';
import { followUser } from '../../thunks/userThunks/followUserThunk';
import type { UserSearchResult } from '../../slices/search/searchSlice';
import { DEFAULT_AVATAR_URL, IMAGE_BASE_URL } from '../../appConfig';
import './userResult.css';

interface UserResultProps {
    user: UserSearchResult;
}

const UserResult = ({ user }: UserResultProps): JSX.Element => {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const handleFollowClick = (e: React.MouseEvent) => {
        // Prevent the Link from navigating when the button is clicked
        e.preventDefault();
        e.stopPropagation();

        setIsLoading(true);
        dispatch(followUser({
            username: user.username,
            isFollowing: user.isFollowing
        })).finally(() => {
            setIsLoading(false);
        });
    };

    return (
        <Link to={`/profile/${user.username}`} className="user-result-card">
            <img
                src={user.profilePictureUrl ? `${IMAGE_BASE_URL}/${user.profilePictureUrl}` : DEFAULT_AVATAR_URL}
                alt={user.displayName}
                className="user-avatar avatar-sm"
            />

            <div className="user-result-info">
                <span className="user-result-displayname">{user.displayName}</span>
                <span className="user-result-username">@{user.username}</span>
                <p className="user-result-bio">{user.bio}</p>
            </div>
            {(!user.isSelf) && <button
                onClick={handleFollowClick} disabled={isLoading}
                className={`follow-button ${user.isFollowing ? 'following' : ''}`}
            >
                {user.isFollowing ? 'Following' : 'Follow'}
            </button>}
        </Link>
    );
};

export default UserResult;