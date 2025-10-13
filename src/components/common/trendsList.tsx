import { type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../utils/hooks';
import { submitSearch } from '../../slices/search/searchSlice';
import { fetchSearchResults } from '../../thunks/searchThunks/fetchResultsThunk';
import './trendsList.css'

interface TrendsListProps {
    topics: string[];
}

/**
 * Displays a list of trending topics within the sidebar.
 */
export const TrendsList = ({ topics }: TrendsListProps): JSX.Element => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleTopicClick = (topic: string) => {
        // This is the correct, efficient pattern:
        // 1. Set both search terms and update the UI state in one action.
        dispatch(submitSearch(topic));
        // 2. Immediately fetch the results for that topic.
        dispatch(fetchSearchResults(topic));
        // 3. Navigate to the search page to display the results.
        navigate('/search');
    };
    return (
        <div>
            <h2 className="sidebar-module-title">Trends for you</h2>
            {topics.length > 0 ? (
                <ul className="trends-list">
                    {topics.slice(0, 5).map((topic) => ( // Show top 5 trends
                        <li key={topic} className="trend-item" onClick={() => handleTopicClick(topic)}>
                            <span className="trend-name">#{topic}</span>
                            <span className="trend-context">Trending</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="sidebar-empty-text">No trends right now.</p>
            )}
        </div>
    );
};

