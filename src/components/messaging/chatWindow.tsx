import React, { useState, useEffect, useLayoutEffect, useRef, type JSX } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { fetchMessageHistory } from '../../thunks/messaging/fetchMessageHistoryThunk';
import { emitSocketEvent } from '../../services/socketService';
import MessageBubble from './messageBubble';
import { useNavigate } from 'react-router-dom';
import { LeftArrowIcon, MessageIcon, SendIcon } from '../../assets/icons';
import { setActiveConversation } from '../../slices/messaging/messageSlice';
import './chatWindow.css';
import { DEFAULT_AVATAR_URL, DEVELOPER_MODE, IMAGE_BASE_URL } from '../../appConfig';
import { markConversationRead } from '../../thunks/messaging/markConversationReadThunk';

// --- Main Chat Window Component ---
const ChatWindow = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // --- Refs for Scroll Preservation ---
    const messageListRef = useRef<HTMLDivElement | null>(null);
    const prevScrollHeightRef = useRef<number | null>(null);

    // --- Get Global Data ---
    const { user } = useAppSelector((state) => state.auth);
    const { messages, pagination, loading, activeConversationId } = useAppSelector((state) => state.messages)
    const isSocketConnected = useAppSelector((state) => state.socket.isConnected);
    const { conversations: allConversations } = useAppSelector((state) => state.conversations);

    const currentUserId = user?.id;

    // Find the specific conversation we're in
    const activeConversation = allConversations.find(
        convo => convo.id === activeConversationId
    );
    // Set fallbacks for name and image
    const chatPartnerName = activeConversation?.name || 'Chat';
    const chatPartnerImage = activeConversation?.imageUrl;

    const [newMessageContent, setNewMessageContent] = useState('');

    useEffect(() => {
        // This part does nothing when the component mounts

        return () => {
            // This cleanup function runs when the component unmounts
            DEVELOPER_MODE && console.log("Leaving messaging page, clearing active conversation.");
            dispatch(setActiveConversation(null));
        };
    }, [dispatch]); // The empty(ish) dependency array ensures it only runs on mount/unmount

    // Effect to fetch initial message history
    useEffect(() => {
        if (activeConversationId && messages.length === 0 && loading === 'idle') {
            dispatch(fetchMessageHistory({ conversationId: activeConversationId, page: 1 }));
        }

    }, [activeConversationId, dispatch, messages.length, loading]);

    const loadingRef = useRef(loading);
    useEffect(() => {
        // We check if the loading state *just changed* from 'pending' to 'succeeded'
        if (loading === 'succeeded' && loadingRef.current === 'pending' && activeConversationId) {
            DEVELOPER_MODE && console.log("Messages loaded, marking conversation as read.");
            dispatch(markConversationRead(activeConversationId));
        }
        // Update the ref for the next render
        loadingRef.current = loading;
    }, [loading, activeConversationId, dispatch]);

    const handleBackClick = () => {
        navigate('/messages', { replace: true });
    };

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessageContent.trim() || !activeConversationId) return;

        emitSocketEvent('send_message', {
            conversation_id: activeConversationId,
            content: newMessageContent.trim(),
        });
        setNewMessageContent('');
    };

    const handleLoadMoreMessages = () => {
        const messageList = messageListRef.current;

        if (activeConversationId && pagination?.hasNext && messageList) {
            prevScrollHeightRef.current = messageList.scrollHeight;

            dispatch(fetchMessageHistory({
                conversationId: activeConversationId,
                page: pagination.page + 1
            }));
        }
    };

    // 7. Add this new useLayoutEffect hook to manage scroll
    useLayoutEffect(() => {
        const messageList = messageListRef.current;
        if (!messageList) return;

        // Check if we have a stored height.
        // This means we just loaded *older* messages.
        if (prevScrollHeightRef.current !== null) {

            // Restore the scroll position
            // We set the new scrollTop to be its old value PLUS the height of the new content.
            messageList.scrollTop = (messageList.scrollHeight - prevScrollHeightRef.current);

            prevScrollHeightRef.current = null; // Reset the ref
        } else {
            // No stored height means this is an *initial load* or a *new message*.
            // Scroll to the bottom. In column-reverse, bottom is scrollTop = 0.
            messageList.scrollTop = messageList.scrollHeight;
        }

    }, [messages]);

    // --- Render Logic ---
    if (!activeConversationId) {
        return (
            <div className="chat-window-placeholder">
                {/* You can replace this text with a message icon component */}
                <span className="placeholder-icon"><MessageIcon /></span>

                <h3>Your Messages</h3>
                <p>
                    Select a conversation from the list or start a new
                    chat to see messages here.
                </p>
            </div>
        );
    }

    const isInputDisabled = !isSocketConnected || !newMessageContent.trim();

    return (
        <div className="chat-window-container">
            <header className="chat-header">
                <button className="chat-header-back-btn" onClick={handleBackClick}>
                    <LeftArrowIcon />
                </button>
                <img
                    src={chatPartnerImage ? `${IMAGE_BASE_URL}/${chatPartnerImage}` : DEFAULT_AVATAR_URL}
                    alt={`${chatPartnerName}'s avatar`}
                    className="chat-header-avatar user-avatar avatar-sm"
                />
                <div className="chat-header-info">
                    {isSocketConnected ? (
                        <span className="chat-header-name">{chatPartnerName}</span>
                    ) : (
                        <span className="chat-header-status">Connecting...</span>
                    )}
                </div>
            </header>

            {/* Message Display Area */}
            <div className="message-list" ref={messageListRef}>
                {pagination?.hasNext && loading !== 'pending' && (
                    <button onClick={handleLoadMoreMessages} className="load-more-messages-btn">
                        Load Older Messages
                    </button>
                )}

                {/* 5. Display the actual error message --- */}
                {loading === 'failed' && <div className="chat-status"> Messages could not be loaded</div>}

                {loading === 'pending' && <div className="chat-status">Loading messages...</div>}

                {/* Render Messages */}
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwnMessage={msg.sender?.id === currentUserId}
                    />
                ))}
            </div>

            {/* Message Input Area */}
            <footer className="chat-input-area">
                <div className='chat-input-row'>
                    <textarea
                        value={newMessageContent}
                        onChange={(e) => setNewMessageContent(e.target.value)}
                        placeholder="Type your message..."
                        rows={1}
                        disabled={!isSocketConnected}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isInputDisabled}
                        className="send-button btn-primary"
                    >
                        <SendIcon />
                    </button>
                </div>
                <p className="chat-caveat">
                    Messaging features are limited. If you experience any issues, please refresh the page.
                </p>
            </footer>
        </div>
    );
};

export default ChatWindow;