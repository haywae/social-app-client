/**
 * src/components/modals/NewChatUserResult.tsx
 */
import type { JSX } from 'react';
import type { UserSearchResult } from '../../slices/search/searchSlice';
import { DEFAULT_AVATAR_URL, IMAGE_BASE_URL } from '../../appConfig';
import './newChatUserResult.css'; // We will create this

interface NewChatUserResultProps {
    user: UserSearchResult;
    onSelect: (user: UserSearchResult) => void;
}

const NewChatUserResult = ({ user, onSelect }: NewChatUserResultProps): JSX.Element => {
    return (
        <li className="new-chat-user-item" onClick={() => onSelect(user)}>
            <img
                src={user.profilePictureUrl ? `${IMAGE_BASE_URL}/${user.profilePictureUrl}` : DEFAULT_AVATAR_URL}
                alt={user.displayName}
                className="user-avatar avatar-sm"
            />
            <div className="new-chat-user-info">
                <span className="new-chat-user-displayname">{user.displayName}</span>
                <span className="new-chat-user-username">@{user.username}</span>
            </div>
        </li>
    );
};

export default NewChatUserResult;