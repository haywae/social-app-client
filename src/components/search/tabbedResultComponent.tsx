import { type JSX } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { setActiveTab } from '../../slices/search/searchSlice';
import UserResult from './userResult';
import PostResult from './postResult';
import { ProfileIcon, ChatIcon } from '../../assets/icons';
import './tabbedResultComponent.css'

/**
 * A reusable component that displays search results in a tabbed interface.
 */
export const TabbedResults = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const { results, activeTab, resultsLoading, error, submittedSearchTerm, searchTerm } = useAppSelector((state) => state.search);
    
    const term = submittedSearchTerm || searchTerm;

    if (resultsLoading === 'pending') return <div className="loading-text">Loading results...</div>;
    if (error) return <p className="no-results-text">Results could not be loaded.</p>;

    const renderActiveTab = () => {
        if (activeTab === 'posts') {
            return results.posts.length > 0
            ? results.posts.map(post => <PostResult key={post.publicId} post={post} />)
            : <p className="no-results-text">No posts found for "{term}"</p>;
        }        
        return results.users.length > 0
        ? results.users.map(user => <UserResult key={user.username} user={user} />)
        : <p className="no-results-text">No users found for "{term}"</p>;
    };

    return (
        <div>
            <div className="search-tabs">
                <button onClick={() => dispatch(setActiveTab('posts'))} className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}>
                    <ChatIcon /><span>Posts</span>
                </button>
                <button onClick={() => dispatch(setActiveTab('users'))} className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}>
                    <ProfileIcon /><span>Users</span>
                </button>
            </div>
            <div className="results-container">
                {renderActiveTab()}
            </div>
        </div>
    );
};