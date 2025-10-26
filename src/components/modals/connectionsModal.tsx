// src/components/modals/ConnectionsModal.tsx

import { type JSX, useState, useEffect } from 'react';
import { useAppDispatch } from '../../utils/hooks';
import { fetchConnections, type UserForList } from '../../thunks/userThunks/fetchConnectionsThunk';
import Modal from './modal';
import UserListItem from '../userProfile/userListItem';
import './connectionsModal.css';

interface ConnectionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
    initialTab: 'followers' | 'following';
}

type FetchError = string | Error | null;

const ConnectionsModal = ({ isOpen, onClose, username, initialTab }: ConnectionsModalProps): JSX.Element => {
    const dispatch = useAppDispatch();
    
    const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
    const [users, setUsers] = useState<UserForList[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<FetchError>(null);

    const PER_PAGE = 20;

    // Effect 1: Resets state when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            setUsers([]);
            setCurrentPage(1);
            setTotalPages(1);
            setError(null);
            setLoading(true)
        }
    }, [isOpen, username, initialTab]);

    // Effect 2: Fetches data
    useEffect(() => {
        if (!isOpen) {
            setLoading(false)
            return; 
        }
        
        if (currentPage > 1 && currentPage > totalPages) {
            return;
        }
        if (!loading) {
            return;
        }
        // We still need the promise reference to handle aborting
        let promise: ReturnType<typeof dispatch<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any

        const fetchData = async () => {
            try {
                promise = dispatch(fetchConnections({
                    username: username,
                    listType: activeTab, 
                    page: currentPage,
                    perPage: PER_PAGE
                }));

                const payload = await promise.unwrap();

                if (currentPage === 1) {
                    setUsers(payload.users); 
                } else {
                    setUsers(prev => [...prev, ...payload.users]); 
                }
                setTotalPages(payload.totalPages);
                setError(null);

            } catch (err: any) { // Catch the error
                if (err.message !== 'Aborted') {
                    setError(err); // Set the error (string or Error object)
                }
            } finally {
                setLoading(false); // Always stop loading
            }
        };

        fetchData();

        // The cleanup function remains the same
        return () => {
            if (promise) {
                promise.abort('Aborted');
            }
        }

    }, [isOpen, username, activeTab, currentPage, dispatch, totalPages, loading]);
    // --- END REFACTORED BLOCK ---

    const handleTabSwitch = (tab: 'followers' | 'following') => {
        if (tab === activeTab || loading) return; 
        
        setActiveTab(tab);
        setUsers([]);
        setCurrentPage(1);
        setTotalPages(1);
        setError(null);
        setLoading(true);
    };

    const handleLoadMore = () => {
        if (currentPage < totalPages && !loading) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const getErrorMessage = (err: FetchError): string => {
        if (!err) return '';
        if (typeof err === 'string') {
            return err;
        }
        return err.message;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="connections-modal">
            
            <div className="connections-modal-header">
                <button 
                    className={`tab-button ${activeTab === 'followers' ? 'active' : ''}`}
                    onClick={() => handleTabSwitch('followers')}
                    disabled={loading}
                >
                    Followers
                </button>
                <button 
                    className={`tab-button ${activeTab === 'following' ? 'active' : ''}`}
                    onClick={() => handleTabSwitch('following')}
                    disabled={loading}
                >
                    Following
                </button>
            </div>

            <div className="connections-modal-list">
                {loading && currentPage === 1 ? (
                    // 1. Show loading ONLY on page 1
                    <p className="modal-message">Loading...</p>
                ) : error ? (
                    // 2. Show error if one exists
                    <p className="modal-message error">{getErrorMessage(error)}</p>
                ) : users.length === 0 ? (
                    // 3. Show "No users" only if not loading, no error, and list is empty
                    <p className="modal-message">No users to display.</p>
                ) : (
                    // 4. Otherwise, render the list
                    users.map(user => (
                        <UserListItem key={user.username} user={user} onCloseModal={onClose} />
                    ))
                )}
            </div>

            <div className="connections-modal-footer">
                {currentPage < totalPages && !loading && (
                    <button 
                        className="btn btn-secondary btn-full-width" 
                        onClick={handleLoadMore}
                    >
                        Load More
                    </button>
                )}
                {loading && currentPage > 1 && (
                    <button 
                        className="btn btn-secondary btn-full-width" 
                        disabled
                    >
                        Loading...
                    </button>
                )}
            </div>
        </Modal>
    );
};

export default ConnectionsModal;