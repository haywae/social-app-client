import { type JSX } from 'react';
import { type UserSearchResult } from '../../slices/search/searchSlice';
import FollowSuggestionItem from './followSuggestionItem';
import './followSuggestions.css'

interface FollowSuggestionsProps {
    users: UserSearchResult[];
}

/**
 * Displays a list of suggested users to follow in the sidebar.
 */
export const FollowSuggestions = ({ users }: FollowSuggestionsProps): JSX.Element => {
    return (
        <div>
            <h2 className="sidebar-module-title">Who to follow</h2>
            {users.length > 0 ? (
                <ul className="follow-suggestion-list">
                    {/* Show top 3 suggestions */}
                    {users.slice(0, 3).map((user) => {
                        return user.isFollowing || user.isSelf ? null : <FollowSuggestionItem key={user.username} user={user} />
                    })}
                </ul>
            ) : (
                <p className="sidebar-empty-text">No suggestions right now.</p>
            )}
        </div>
    );
};

