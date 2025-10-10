export interface NotificationPreferences {
    email_on_comment?: boolean;
    email_on_like?: boolean;
    email_on_follow?: boolean;
    push_on_mention?: boolean;
}

export interface UserSettings {
    username: string;
    display_name: string;
    email: string;
    bio: string;
    country: string;
    profile_picture_url: string;
    notification_preferences: NotificationPreferences;
}