import { type JSX } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { NotificationData } from '../../slices/notification/notificationSlice';
import { HeartIcon, ChatIcon, FollowIcon } from '../../assets/icons';
import { DEFAULT_AVATAR_URL } from '../../appConfig';
import { formatRelativeTimestamp } from '../../utils/timeformatUtils';
import './notificationItem.css';

interface NotificationItemProps {
    notification: NotificationData;
}

const NotificationItem = ({ notification }: NotificationItemProps): JSX.Element | null => {
    const { type, fromUser, post, isRead, comment, createdAt } = notification;
    const navigate = useNavigate();

    if (!fromUser) {
        return null;
    }

    const handleUserClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        navigate(`/profile/${fromUser.username}`);
    };

    const renderIcon = () => {
        switch (type) {
            case 'like': return <HeartIcon className="notification-icons like" />;
            case 'comment': return <ChatIcon className="notification-icons reply" />;
            case 'follow': return <FollowIcon className="notification-icons follow" />;
            default: return null;
        }
    };

    const renderText = () => {
        const userLink = (
            <span className="notification-user-link" onClick={handleUserClick}>
                {fromUser.displayName}
            </span>
        );
        switch (type) {
            case 'like':
                if (comment) return <>{userLink} liked your comment.</>;
                if (post) return <>{userLink} liked your post.</>;
                return <>{userLink} liked content that has since been deleted.</>;
            
            case 'comment':
                return <>{userLink} commented on your post.</>;
            
            case 'follow':
                return <>{userLink} started following you.</>;
            
            case 'mention':
                if (comment) return <>{userLink} mentioned you in a comment.</>;
                if (post) return <>{userLink} mentioned you in a post.</>;
                return <>{userLink} mentioned you in content that has since been deleted.</>;
            
            default:
                return 'You have a new notification.';
        }
    };
        
    const linkDestination = () => {
        if (comment && comment.postId) return `/post/${comment.postId}?fc=${comment.id}`;
        if (post && post.id) return `/post/${post.id}`;
        return `/profile/${fromUser.username}`;
    };

    const contentSnippet = comment?.content || post?.content;

    return (
        <Link to={linkDestination()} className={`notification-item ${!isRead ? 'unread' : ''}`}>
            <div className="notification-icon-container">{renderIcon()}</div>
            <div className="notification-content">
                <img src={fromUser.avatarUrl || DEFAULT_AVATAR_URL} alt={fromUser.displayName} className="user-avatar avatar-sm" />
                
                {/* The entire text block is now one unit */}
                <div className="notification-text-content">
                    <p className="notification-text">{renderText()}</p>
                    {contentSnippet && <p className="notification-post-snippet">"{contentSnippet}"</p>}
                </div>

                {/* The timestamp is now a sibling, pushed to the right by the text content */}
                <span className="notification-timestamp">{formatRelativeTimestamp(createdAt)}</span>
            </div>
        </Link>
    );
}
export default NotificationItem;

