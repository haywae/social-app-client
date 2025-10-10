import { type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { setSearchTerm, submitSearch } from '../../slices/search/searchSlice';
import { SearchIcon } from '../../assets/icons';
import './sidebarSearch.css'

/**
 * A search input component specifically for the RightSidebar.
 */
export const SidebarSearch = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { searchTerm } = useAppSelector((state) => state.search);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        dispatch(submitSearch());
        navigate('/search');
    };

    return (
        <div className="sidebar-search-module">
            <form onSubmit={handleSearchSubmit} className="sidebar-search-bar">
                <SearchIcon className="sidebar-search-icon" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="sidebar-search-input"
                    value={searchTerm}
                    onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                />
            </form>
        </div>
    );
};
