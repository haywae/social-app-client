export interface UserProfileData {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    bio: string;
    followerCount: number;
    followingCount: number;
    postCount: number;
    joinedDate: string; // Expecting an ISO 8601 date string
    isFollowing: boolean;
}