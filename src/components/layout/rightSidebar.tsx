import { useEffect, type JSX } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { fetchDiscoveryData } from '../../thunks/searchThunks/fetchDiscoveryThunk';
import { SidebarSearch } from './sidebarSearch';
import { TrendsList } from '../common/trendsList';
import { FollowSuggestions } from '../common/followSuggestions';
import './rightSidebar.css';

/**
 * The main container for the right sidebar of the application.
 * It displays a search bar, trending topics, and user suggestions.
 */
const RightSidebar = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const { suggestedUsers, trendingTopics } = useAppSelector((state) => state.search);
    const onSearchPage = location.pathname === '/search';

    // Fetch discovery data (trends and suggestions) when the component mounts.
    useEffect(() => {
        // We only fetch if the data isn't already present to avoid redundant API calls.
        if (suggestedUsers.length === 0 && trendingTopics.length === 0) {
            dispatch(fetchDiscoveryData());
        }
    }, [dispatch, suggestedUsers.length, trendingTopics.length]);

    return (
        <aside className="right-sidebar-container">
            {/* The search bar is only rendered on pages other than the main search page */}
            {!onSearchPage && <SidebarSearch />}

            <div className="sidebar-module">
                <TrendsList topics={trendingTopics} />
            </div>

            <div className="sidebar-module">
                <FollowSuggestions users={suggestedUsers} />
            </div>
        </aside>
    );
};

export default RightSidebar;