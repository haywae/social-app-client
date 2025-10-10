import { useAppSelector } from "../../utils/hooks";
import UserResult from "./userResult";
import { TabbedResults } from "./tabbedResultComponent";
import { setSearchTerm, submitSearch } from "../../slices/search/searchSlice"; 
import { fetchSearchResults } from "../../thunks/searchThunks/fetchResultsThunk";
import { useAppDispatch } from "../../utils/hooks";
import "./searchResultContent.css"

/**
 * Renders either the discovery content or the full, tabbed search results.
 */
export const SearchResultsContent = () => {
    const { submittedSearchTerm, suggestedUsers, trendingTopics, discoveryLoading} = useAppSelector((state) => state.search);
    const dispatch = useAppDispatch();
    const handleTopicClick = (topic: string) => {
        // Set the search term to the topic they clicked
        dispatch(setSearchTerm(topic));
        // Immediately submit that search term to trigger the results view
        dispatch(submitSearch(topic));
        dispatch(fetchSearchResults(topic));
    };

    // --- Submitted Search Results View ---
    if (submittedSearchTerm) {
        return <TabbedResults />
    }

    // --- Default Discovery View ---
    if (discoveryLoading === 'pending' && suggestedUsers.length === 0) return <div className="loading-text">Loading discovery...</div>;
    return (
        <div className="discovery-container">
            <div>
                <h2 className="section-title">Trending Topics</h2>
                <div className="topics-container">
                    {trendingTopics.map((topic) => (
                        <button 
                            onClick={() => handleTopicClick(topic)}
                            key={topic} 
                            className="topic-tag"
                        >
                            #{topic}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <h2 className="section-title">Suggested Users</h2>
                <div className="search-results-container">
                    {suggestedUsers.map(user => <UserResult key={user.username} user={user} />)}
                </div>
            </div>
        </div>
    );

}
