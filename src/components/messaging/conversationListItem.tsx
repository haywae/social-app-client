import { useState, useRef, useEffect, type JSX } from 'react';
import type { ConversationData } from '../../types/conversationType';
import { DEFAULT_AVATAR_URL, IMAGE_BASE_URL } from '../../appConfig';
import { useAppDispatch } from '../../utils/hooks';
import { formatChatTimestamp } from '../../utils/timeformatUtils';
import { EllipseIcon, TrashIcon } from '../../assets/icons';
import './conversationListItem.css'
import { openModal } from '../../slices/ui/uiSlice';


interface ConversationListItemProps {
    conversation: ConversationData;
    isActive: boolean;
    onClick: () => void;
}
const ConversationListItem = ({ conversation, isActive, onClick }: ConversationListItemProps): JSX.Element => {
    const { name, imageUrl, lastMessage, unreadCount } = conversation;
    const dispatch = useAppDispatch();
    const [menuOpen, setMenuOpen] = useState(false);

    const menuRef = useRef<HTMLDivElement | null>(null);


    const lastMessageText = lastMessage?.content ?? 'No messages yet';
    const lastMessageTime = lastMessage?.createdAt
        ? formatChatTimestamp(lastMessage.createdAt) // Only call if createdAt is a string
        : ''; // Provide a default empty string otherwise


    useEffect(() => {
        // Function to run when a click happens
        const handleClickOutside = (event: MouseEvent) => {
            // If the menu is open and the click is *outside* the menu ref
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false); // Close the menu
            }
        };

        // If the menu is open, attach the event listener
        if (menuOpen) {
            // 'mousedown' fires before 'click', which prevents some race conditions
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Cleanup function: Remove the listener when the component unmounts
        // or when the menu is closed (i.e., when menuOpen changes)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]); // This effect depends only on the menuOpen state

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the li's onClick from firing
        setMenuOpen(prev => !prev);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen(false);
        // Dispatch the openModal action with the required props
        dispatch(openModal({
            modalType: 'CONFIRM_DELETE_CONVERSATION',
            modalProps: {
                conversation: conversation,
            }
        }))
    };

    return (
        <li
            className={`conversation-list-item ${isActive ? 'active' : ''}`}
            onClick={() => { if (!menuOpen) onClick() }}
            role="button" 
            tabIndex={0} 
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
        >
            <img
                src={imageUrl ? `${IMAGE_BASE_URL}/${imageUrl}` : DEFAULT_AVATAR_URL}
                alt={`${name}'s avatar`}
                className="conversation-avatar user-avatar avatar-sm"
            />
            <div className='conversation-details'>
                <div className="conversation-header">
                    <span className="conversation-name">{name}</span>
                    <span className="conversation-time">{lastMessageTime}</span>
                </div>
                <div className="conversation-preview-wrapper">
                    <p className="conversation-preview">{lastMessageText}</p>

                    <div className='conversation-preview-options'>
                        {(unreadCount || 0) > 0 && (
                            <span className="unread-indicator">{unreadCount}</span>
                        )}
                        <button className="conversation-options-btn" onClick={toggleMenu} title="Options">
                            <EllipseIcon />
                        </button>

                        {/* 1. MOVE THE MENU JSX HERE */}
                        {menuOpen && (
                            <div className="conversation-options-menu" onClick={e => e.stopPropagation()} ref={menuRef}>
                                <button className="conversation-delete-btn" onClick={handleDeleteClick}>
                                    <TrashIcon /> Remove Chat
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </li>
    );
};
export default ConversationListItem;