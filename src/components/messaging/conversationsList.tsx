import { useEffect, type JSX } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { useNavigate } from 'react-router-dom';
import { fetchConversations } from '../../thunks/messaging/fetchConversationsThunk';
import ConversationListItem from './conversationListItem';
import { AddIcon, MessageIcon } from '../../assets/icons';
import { openModal } from '../../slices/ui/uiSlice';
import './conversationsList.css';


const ConversationList = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Select data from Redux state
    const conversations = useAppSelector((state => state.conversations.conversations));
    const loading = useAppSelector((state => state.conversations.loading));
    const activeConversationId = useAppSelector((state) => state.messages.activeConversationId); // Get active ID from messages slice

    // Fetch conversations when the component mounts
    useEffect(() => {
        // Only fetch if not already loading or succeeded to prevent redundant fetches
        if (loading === 'idle') {
            dispatch(fetchConversations());
        }
    }, [dispatch, loading]); // Depend on loading state

    const handleConversationClick = (conversationId: string) => {
        // Instead of dispatching, we navigate. This makes the URL the source of truth.
        navigate(`/messages/${conversationId}`);
    };

    const handleNewChatClick = () => {
        dispatch(openModal({ modalType: 'NEW_CHAT', modalProps: {} }));
    };

    // --- Render Logic ---
    let content: JSX.Element;

    if (loading === 'pending') {
        content = <div className="conversation-list-status">Loading conversations...</div>;
    } else if (loading === 'failed') {
        content = <div className="conversation-list-status ">Conversations could not be loaded</div>;
    } else if (conversations.length === 0) {
        content = (
            <div className="conversation-list-placeholder">
                {/* You can replace this text with a message icon component */}
                <span className="placeholder-icon">
                    <MessageIcon/>
                </span>

                <h3>No messages yet</h3>
                <p>
                    Click the <AddIcon /> button above to find a user and
                    start a new chat.
                </p>
            </div>
        );
    } else {
        content = (
            <ul className="conversation-list-ul">
                {conversations.map((convo) => (
                    <ConversationListItem
                        key={convo.id}
                        conversation={convo}
                        isActive={convo.id === activeConversationId}
                        onClick={() => handleConversationClick(convo.id)}
                    />
                ))}
            </ul>
        );
    }

    return (
        <aside className="conversation-list-container">
            <div className='conversation-list-header'>
                <h2>Chats</h2>
                <button
                    className="new-chat-btn"
                    onClick={handleNewChatClick}
                    title="New Chat"
                >
                    <AddIcon />
                </button>
            </div>
            {/* Add Search/Filter input here if needed */}
            <div className="conversation-scroll-area">
                {content}
            </div>
        </aside>
    );
};

export default ConversationList;