import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { submitSearch } from '../../slices/search/searchSlice';
import { TabbedResults } from './tabbedResultComponent';
import { fetchSearchResults } from '../../thunks/searchThunks/fetchResultsThunk';
import './searchOverlay.css';


/**
 * A component for the live search results overlay.
 */
export const SearchOverlay = () => {
    const { searchTerm, results } = useAppSelector((state) => state.search);
    const dispatch = useAppDispatch();

    const handleFullSearchClick = () => {
        dispatch(submitSearch());
        dispatch(fetchSearchResults(searchTerm));
    };

    // Determine if there are any results to show in the tabs
    const hasResults = results.users.length > 0 || results.posts.length > 0;

    return (
        <div className="search-overlay">
            {/* The clickable "Search for..." element */}
            <div className="search-overlay-action" onClick={handleFullSearchClick}>
                <span>Search for "{searchTerm}"</span>
            </div>

            {/* The overlay uses the tabbed interface to show the tabs if there are results */}
            {hasResults && <TabbedResults />}
        </div>
    );
};