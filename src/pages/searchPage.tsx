import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector, useTitle } from '../utils/hooks';
import { useDebounce } from '../utils/searchUtils';
import { fetchDiscoveryData } from '../thunks/searchThunks/fetchDiscoveryThunk';
import { fetchSearchResults } from '../thunks/searchThunks/fetchResultsThunk';
import { clearSearchResults, setSearchTerm, submitSearch } from '../slices/search/searchSlice';
import { SearchResultsContent } from '../components/search/searchResultContent';
import { SearchOverlay } from '../components/search/searchOverlay';
import { TabbedResults } from '../components/search/tabbedResultComponent';
import { CloseIcon, SearchIcon } from '../assets/icons';
import '../styles/searchPage.css';

/**
 * Main container for the search page experience.
 */
const SearchPage = () => {
    const dispatch = useAppDispatch();
    const { searchTerm, submittedSearchTerm } = useAppSelector((state) => state.search);
    const navigate = useNavigate();
    const location = useLocation();

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const { loading: authLoading } = useAppSelector((state) => state.auth);


    // --- Effects for Data Fetching and Cleanup ---
    useEffect(() => {
        // This effect now waits for the initial authentication check to complete.
        // It will only run when authLoading changes to 'succeeded' or 'failed'.
        if (authLoading === 'succeeded' || authLoading === 'failed') {
            if (!searchTerm && !submittedSearchTerm) {
                dispatch(fetchDiscoveryData());
            }
        }
    }, [authLoading, dispatch, searchTerm, submittedSearchTerm]); // Add authLoading to the dependency array


    // --- Effect for debounced Search Actions ---
    useEffect(() => {
        // This effect ONLY handles the search-as-you-type functionality.
        // It runs if the user has typed something, but has NOT submitted a final search.
        if (debouncedSearchTerm && !submittedSearchTerm) {
            dispatch(fetchSearchResults(debouncedSearchTerm));
        } else if (!debouncedSearchTerm && !submittedSearchTerm) {
            // When the search bar is cleared, this clears the live results.
            dispatch(clearSearchResults());
        }
    }, [debouncedSearchTerm, submittedSearchTerm, dispatch]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Prevent page reload
        if (searchTerm.trim()) {
            dispatch(submitSearch());
            dispatch(fetchSearchResults(searchTerm.trim()));
        }
    };

    // --- Centralized Rendering Logic ---
    const renderContent = () => {
        if (submittedSearchTerm) {
            // State 3: A search has been submitted. Show the full results.
            return <TabbedResults />;
        }
        if (searchTerm) {
            // State 2: User is typing. Show the live results overlay.
            return <SearchOverlay />;
        }
        // State 1: Default view. Show the discovery content.
        return <SearchResultsContent />;
    };

    const handleNavigate = () => {
        // Check if the user was navigated to this page from within the app
        if (location.key !== 'default') {
            // If there's a history stack, go back one step
            navigate(-1);
        } else {
            navigate('/'); // The public homepage
        }
    };
    // --- Render Logic ---
    useTitle('Search - WolexChange');
    return (
        <div className="search-page-container">
            <form onSubmit={handleSearchSubmit} className="search-bar">
                <div className='search-input-wrapper'>
                    <SearchIcon className="search-bar-icon" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                        autoFocus
                    />
                    {searchTerm && <CloseIcon className="search-clear-icon" onClick={() => dispatch(setSearchTerm(''))} />}
                </div>
                <button type="button" onClick={handleNavigate} className="search-cancel-button">Cancel</button>
            </form>
            <div className="search-page-content">
                {renderContent()}
            </div>
        </div>

    );
};

export default SearchPage;