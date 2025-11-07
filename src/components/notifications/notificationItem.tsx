import { type JSX } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { NotificationData } from '../../slices/notification/notificationSlice';
import { HeartIcon, FollowIcon, MentionIcon } from '../../assets/icons';
import { DEFAULT_AVATAR_URL, IMAGE_BASE_URL } from '../../appConfig';
import { formatRelativeTimestamp } from '../../utils/timeformatUtils';
import './notificationItem.css';

interface NotificationItemProps {
    notification: NotificationData;
}

const NotificationItem = ({ notification }: NotificationItemProps): JSX.Element | null => {
    const { type, fromUser, post, isRead, createdAt } = notification;
    const navigate = useNavigate();

    if (!fromUser) {
        return null;
    }
    // Check is deleted flag from the backend
    const isDeletedUser = fromUser.isDeleted === true;

    const handleUserClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        // Only navigate if the user is not deleted
        if (isDeletedUser) {
            navigate(`/profile/${fromUser.username}`);
        }
    };

    const renderIcon = () => {
        switch (type) {
            case 'like': return <HeartIcon className="notification-icons like" />;
            case 'follow': return <FollowIcon className="notification-icons follow" />;
            case 'mention': return <MentionIcon className="notification-icons mention" />;
            default: return null;
        }
    };

    const renderText = () => {
        const userLink = (
            // If user is deleted, render plain text. Otherwise, render the link.
            isDeletedUser ? (
                <span className="notification-user-link">
                    {fromUser.displayName}
                </span>
            ) : (
                <span className="notification-user-link" onClick={handleUserClick}>
                    {fromUser.displayName}
                </span>
            )
        );
        switch (type) {
            case 'like':
                if (post) return <>{userLink} liked your post.</>;
                return <>{userLink} liked content that has since been deleted.</>;

            case 'follow':
                return <>{userLink} started following you.</>;

            case 'mention':
                if (post) return <>{userLink} mentioned you in a post.</>;
                return <>{userLink} mentioned you in content that has since been deleted.</>;

            default:
                return 'You have a new notification.';
        }
    };

    const linkDestination = () => {
        if (post && post.id) return `/post/${post.id}`;
        // Fallback: only go to profile if user is NOT deleted
        if (!isDeletedUser) {
            return `/profile/${fromUser.username}`;
        }
        // If user is deleted and there's no post/comment, don't navigate
        return '#';

    };

    const contentSnippet = post?.content;
    const destination = linkDestination();
    const canNavigate = destination !== '#';

    return (
        <Link
            to={destination}
            className={`notification-item ${!isRead ? 'unread' : ''} ${!canNavigate ? 'no-link' : ''}`}
            onClick={(e) => { if (!canNavigate) e.preventDefault(); }}
        >
            <div className="notification-icon-container">{renderIcon()}</div>
            <div className="notification-content">
                <img
                    src={fromUser.avatarUrl ? `${IMAGE_BASE_URL}/${fromUser.avatarUrl}` : DEFAULT_AVATAR_URL}
                    alt={fromUser.displayName}
                    className="user-avatar avatar-sm"
                />
                {/* The entire text block */}
                <div className="notification-text-content">
                    <p className="notification-text">{renderText()}</p>
                    {contentSnippet && <p className="notification-post-snippet">"{contentSnippet}"</p>}
                </div>

                {/* The timestamp is pushed to the right by the text content */}
                <span className="notification-timestamp">{formatRelativeTimestamp(createdAt)}</span>
            </div>
        </Link>
    );
}
export default NotificationItem;

