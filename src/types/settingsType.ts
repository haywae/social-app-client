export interface NotificationPreferences {
    email_on_comment?: boolean;
    email_on_like?: boolean;
    email_on_follow?: boolean;
    push_on_mention?: boolean;
}

export interface UserSettings {
    username: string;
    displayName: string;
    email: string;
    bio: string;
    country: string;
    avatarUrl: string;
    notificationPreferences: NotificationPreferences;
}

export interface CreatePasswordArgs {
    new_password: string;
}