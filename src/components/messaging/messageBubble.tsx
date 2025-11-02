import type { MessageData } from '../../types/messageType';
import { DEFAULT_AVATAR_URL, IMAGE_BASE_URL } from '../../appConfig';
import { formatRelativeTimestamp } from '../../utils/timeformatUtils';
import './messageBubble.css'

// --- Individual Message Bubble Component ---
const MessageBubble = ({ message, isOwnMessage }: { message: MessageData; isOwnMessage: boolean }) => {
    const { content, sender, createdAt, isDeleted } = message;

    const messageTime = formatRelativeTimestamp(createdAt);
    const messageContent = isDeleted ? <i>Message deleted</i> : content;

    return (
        <div className={`message-bubble ${isOwnMessage ? 'own-message' : 'other-message'}`}>
            {!isOwnMessage && (
                <img
                    src={sender.avatarUrl? `${IMAGE_BASE_URL}/${sender.avatarUrl}` : DEFAULT_AVATAR_URL}
                    alt={`${sender.username}'s avatar`}
                    className="message-avatar user-avatar avatar-xs" // Use avatar class
                />
            )}
            <div className="message-content">
                {!isOwnMessage && <div className="message-sender-name">{sender.username}</div>}
                <div className="message-text">{messageContent}</div>
                <div className="message-timestamp">{messageTime}</div>
            </div>
        </div>
    );
};


export default MessageBubble;