import { type NotificationData } from '../slices/notification/notificationSlice';


// This interface matches the raw object from your backend API
interface ApiNotification {
    id: string;
    action_type: 'like' | 'comment' | 'follow' | 'mention';
    is_read: boolean;
    created_at: string;
    actor: {
        username: string;
        displayName: string;
        profile_picture_url: string;
    };
    target_post?: {
        id: string;
        content: string;
    };
}

/**
 * Transforms a raw API notification into the client-side NotificationData format.
 */
export const transformApiNotification = (apiNotif: ApiNotification): NotificationData => {
    return {
        id: apiNotif.id,
        type: apiNotif.action_type,
        isRead: apiNotif.is_read,
        createdAt: apiNotif.created_at,
        fromUser: {
            username: apiNotif.actor.username,
            displayName: apiNotif.actor.displayName,
            avatarUrl: apiNotif.actor.profile_picture_url,
        },
        post: apiNotif.target_post ? {
            id: apiNotif.target_post.id,
            content: apiNotif.target_post.content,
        } : undefined,
    };
};