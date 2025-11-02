import type { ConversationData } from '../../types/conversationType';
import { DEFAULT_AVATAR_URL, IMAGE_BASE_URL } from '../../appConfig'; // Default avatar
import { formatRelativeTimestamp } from '../../utils/timeformatUtils';


const ConversationListItem = ({
    conversation,
    isActive,
    onClick
}: {
    conversation: ConversationData;
    isActive: boolean;
    onClick: () => void;
}) => {
    const { name, imageUrl, lastMessage, unreadCount } = conversation;


    const lastMessageText = lastMessage?.content ?? 'No messages yet';
    const lastMessageTime = lastMessage?.createdAt
        ? formatRelativeTimestamp(lastMessage.createdAt) // Only call if createdAt is a string
        : ''; // Provide a default empty string otherwise

    return (
        <li
            className={`conversation-list-item ${isActive ? 'active' : ''}`}
            onClick={onClick}
            role="button" // Accessibility
            tabIndex={0} // Accessibility
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }} // Accessibility
        >
            <img
                src={imageUrl? `${IMAGE_BASE_URL}/${imageUrl}` : DEFAULT_AVATAR_URL}
                alt={`${name}'s avatar`}
                className="conversation-avatar user-avatar avatar-sm"
            />
            <div className="conversation-details">
                <div className="conversation-header">
                    <span className="conversation-name">{name}</span>
                    <span className="conversation-time">{lastMessageTime}</span>
                </div>
                <div className="conversation-preview-wrapper">
                    <p className="conversation-preview">{lastMessageText}</p>
                    {/* --- 3. ADD THIS INDICATOR --- */}
                    {(unreadCount || 0) > 0 && (
                        <span className="unread-indicator">{unreadCount}</span>
                    )}
                </div>
            </div>
        </li>
    );
};
export default ConversationListItem;