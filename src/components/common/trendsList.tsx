import { type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../utils/hooks';
import { setSearchTerm, submitSearch } from '../../slices/search/searchSlice';
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
        dispatch(setSearchTerm(topic));
        dispatch(submitSearch());
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

