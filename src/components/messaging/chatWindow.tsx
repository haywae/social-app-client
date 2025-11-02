import React, { useState, useEffect, useRef, type JSX } from 'react';
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
    const { user } = useAppSelector((state) => state.auth);
    const currentUserId = user?.id;

    // --- Get data for the header ---
    const activeConversationId = useAppSelector((state) => state.messages.activeConversationId);
    const { conversations: allConversations } = useAppSelector((state) => state.conversations);

    // Find the specific conversation we're in
    const activeConversation = allConversations.find(
        convo => convo.id === activeConversationId
    );
    // Set fallbacks for name and image
    const chatPartnerName = activeConversation?.name || 'Chat';
    const chatPartnerImage = activeConversation?.imageUrl;
    // --- End header data ---

    // Select data from Redux state for the active conversation
    const messages = useAppSelector((state) => state.messages.messages);
    const pagination = useAppSelector((state) => state.messages.pagination);
    const loading = useAppSelector((state) => state.messages.loading);

    const isSocketConnected = useAppSelector((state) => state.socket.isConnected);

    const [newMessageContent, setNewMessageContent] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // This effect runs when the active chat or socket connection changes
        if (activeConversationId && isSocketConnected) {
            // Tell the server to join the new conversation's room
            emitSocketEvent('join_conversation', { 
                conversation_id: activeConversationId 
            });
        }

        // The cleanup function runs when the component unmounts
        // or before the effect runs again
        return () => {
            // --- 2. THIS IS THE FIX ---
            // Only attempt to leave if the socket is *also* connected
            // This prevents errors during React's fast re-renders
            if (activeConversationId && isSocketConnected) {
                emitSocketEvent('leave_conversation', { 
                    conversation_id: activeConversationId 
                });
            }
        };
    }, [activeConversationId, isSocketConnected]); // Dependency array is correct

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

    // Effect to scroll to the bottom when new messages are added
    // (This is the improved version from our previous discussion to prevent scroll-jumping)
    const prevMessageCountRef = useRef(messages.length);
    
    useEffect(() => {
        // Check if new messages were added (not old ones)
        const isNewMessageAdded = messages.length > prevMessageCountRef.current;

        if (isNewMessageAdded) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }

        // Update the ref for the next render
        prevMessageCountRef.current = messages.length;

    }, [messages]); // This dependency is correct

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
        if (activeConversationId && pagination?.hasPrev) {
            dispatch(fetchMessageHistory({
                conversationId: activeConversationId,
                page: pagination.page + 1
            }));
        }
    };

    // --- Render Logic ---
    if (!activeConversationId) {
        return (
            <div className="chat-window-placeholder">
                {/* You can replace this text with a message icon component */}
                <span className="placeholder-icon"><MessageIcon/></span>
                
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
                    className="chat-header-avatar user-avatar avatar-sm" // Use avatar class
                />
                <span className="chat-header-name">{chatPartnerName}</span>
            </header>

            {/* Message Display Area */}
            <div className="message-list">
                {loading === 'pending' && <div className="chat-status">Loading messages...</div>}
                {pagination?.hasPrev && loading !== 'pending' && (
                    <button onClick={handleLoadMoreMessages} className="load-more-messages-btn">
                        Load Older Messages
                    </button>
                )}

                {/* 5. Display the actual error message --- */}
                {loading === 'failed' && <div className="chat-status"> Messages could not be loaded</div>}

                {/* Render Messages */}
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwnMessage={msg.sender?.id === currentUserId}
                    />
                ))}
                {!isSocketConnected && loading !== 'pending' && (
                    <div className="chat-status">
                        Reconnecting...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <footer className="chat-input-area">
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
                    <SendIcon/>
                </button>
            </footer>
        </div>
    );
};

export default ChatWindow;