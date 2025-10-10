import { type JSX } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../utils/hooks';
import { type UserSearchResult } from '../../slices/search/searchSlice';
import { followUser } from '../../thunks/userThunks/followUserThunk'; 
import { DEFAULT_AVATAR_URL } from '../../appConfig';
import './followSuggestionItem.css';

interface FollowSuggestionItemProps {
    user: UserSearchResult;
}

const FollowSuggestionItem = ({ user }: FollowSuggestionItemProps): JSX.Element => {
    const dispatch = useAppDispatch();

    const handleFollowClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(followUser({ username: user.username, isFollowing: user.isFollowing }));
    };

    return (
        <li className="follow-suggestion">
            <Link to={`/profile/${user.username}`} className="follow-suggestion-user-info-nav">
                <img src={user.profilePictureUrl || DEFAULT_AVATAR_URL} alt={`${user.displayName}'s avatar`} className='user-avatar avatar-sm'/>
                <div>
                    <strong>{user.displayName}</strong>
                    <small>@{user.username}</small>
                </div>
            </Link>
            
            <button 
                className={`follow-button ${user.isFollowing ? 'following' : ''}`}
                onClick={handleFollowClick}
            >
                {user.isFollowing ? 'Following' : 'Follow'}
            </button>
        </li>
    );
};

export default FollowSuggestionItem;