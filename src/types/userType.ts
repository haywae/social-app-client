/**
 * A centralized and comprehensive definition of a user's data structure.
 * This is the single source of truth for user-related data across the app.
 */
export interface UserData {
    id?: string; // Optional, might not be available everywhere
    username: string;
    displayName: string;
    profilePictureUrl: string;
    isEmailVerified: boolean;
    country: string | null;
    dateOfBirth: string | null; // This will be an ISO 8601 date string
    hasPassword: boolean;
    // Expecting an ISO 8601 date string
}
