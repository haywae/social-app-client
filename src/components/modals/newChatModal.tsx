/**
 * src/components/modals/NewChatModal.tsx
 */
import { useState, useEffect, type JSX } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { useDebounce } from '../../utils/searchUtils'; // Assuming you have this
import { fetchSearchResults } from '../../thunks/searchThunks/fetchResultsThunk';
import { clearSearchResults } from '../../slices/search/searchSlice';
import { createConversation } from '../../thunks/messaging/createConversationThunk';
import Modal from '../modals/modal';
import NewChatUserResult from '../messaging/newChatUserResult'; // We will create this
import type { UserSearchResult } from '../../slices/search/searchSlice';
import './newChatModal.css'; // We will create this

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NewChatModal = ({ isOpen, onClose }: NewChatModalProps): JSX.Element => {
    const dispatch = useAppDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const { results, resultsLoading: loading } = useAppSelector((state) => state.search);

    // Effect to fetch search results as the user types
    useEffect(() => {
        if (debouncedSearchTerm) {
            dispatch(fetchSearchResults(debouncedSearchTerm));
        } else {
            dispatch(clearSearchResults());
        }
    }, [debouncedSearchTerm, dispatch]);

    // Clear search results when modal is closed
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            dispatch(clearSearchResults());
        }
    }, [isOpen, dispatch]);

    const handleUserSelect = (user: UserSearchResult) => {
        dispatch(createConversation({ username: user.username }));
        onClose(); // Close the modal
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Start a new chat">
            <div className="new-chat-container">
                <input
                    type="text"
                    placeholder="Search for a user..."
                    className="new-chat-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
                <ul className="new-chat-results-list">
                    {loading === 'pending' && <li className="chat-list-status">Loading...</li>}
                    
                    {loading === 'succeeded' && results.users.length === 0 && searchTerm && (
                        <li className="chat-list-status">No users found.</li>
                    )}

                    {results.users.map((user) => (
                        // Don't show the logged-in user in the list
                        !user.isSelf && (
                            <NewChatUserResult
                                key={user.username}
                                user={user}
                                onSelect={handleUserSelect}
                            />
                        )
                    ))}
                </ul>
            </div>
        </Modal>
    );
};

export default NewChatModal;