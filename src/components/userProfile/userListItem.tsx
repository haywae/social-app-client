// src/components/modals/UserListItem.tsx

import { type JSX, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { followUser } from '../../thunks/userThunks/followUserThunk';
import { type UserForList } from '../../thunks/userThunks/fetchConnectionsThunk';
import { DEFAULT_AVATAR_URL, IMAGE_BASE_URL } from '../../appConfig';

interface UserListItemProps {
    user: UserForList;
    onCloseModal: () => void;
}

const UserListItem = ({ user, onCloseModal }: UserListItemProps): JSX.Element => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    // We need the logged-in user to know if we can follow/unfollow
    const loggedInUser = useAppSelector((state) => state.auth.user);

    const handleFollow = (e: React.MouseEvent) => {
        e.stopPropagation(); // Stop the link navigation
        e.preventDefault();  // Stop the link navigation

        if (!loggedInUser) {
            navigate('/login');
            onCloseModal(); // Close the modal before navigating
            return;
        }

        setIsFollowLoading(true);
        dispatch(followUser({
            username: user.username,
            isFollowing: user.isFollowing
        })).finally(() => {
            setIsFollowLoading(false);
            // Note: In a real app, you'd dispatch an update to the user
            // in the modal's state here, but for now this thunk
            // should update the profile state, which is fine.
        });
    };

    /** Renders the correct button (Follow, Following, or Edit Profile) */
    const renderActionButton = () =>{
        if (user.isSelf) {
            return (
                <button 
                    className="btn btn-secondary"
                    onClick={() => {
                        navigate('/settings/profile');
                        onCloseModal();
                    }}
                >
                    Edit Profile
                </button>
            );
        }

        return (
            <button
                onClick={handleFollow}
                disabled={isFollowLoading}
                className={`btn ${user.isFollowing ? 'btn-secondary' : 'btn-primary'}`}
            >
                {isFollowLoading ? '...' : (user.isFollowing ? 'Following' : 'Follow')}
            </button>
        );
    };

    return (
        <Link to={`/profile/${user.username}`} className="user-list-item" onClick={onCloseModal}>
            <img
                src={user.authorAvatarUrl ? `${IMAGE_BASE_URL}/${user.authorAvatarUrl}` : DEFAULT_AVATAR_URL}
                alt={`${user.authorName}'s avatar`}
                className="user-list-item-avatar"
            />
            <div className="user-list-item-info">
                <span className="user-list-item-name">{user.authorName}</span>
                <span className="user-list-item-username">@{user.username}</span>
                <p className="user-list-item-bio">{user.bio}</p>
            </div>
            <div className="user-list-item-action">
                {loggedInUser && renderActionButton()}
            </div>
        </Link>
    );
};

export default UserListItem;