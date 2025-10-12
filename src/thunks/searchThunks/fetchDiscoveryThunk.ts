import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apiInterceptor';
import type { UserSearchResult } from '../../slices/search/searchSlice';

// Interface for the data structure we want in our Redux store
interface DiscoveryData {
    suggestedUsers: UserSearchResult[];
    trendingTopics: string[];
}

// Interfaces for the raw API response
interface ApiUser {
    bio: string;
    display_name: string;
    is_following: boolean;
    profile_picture_url: string;
    username: string;
    is_self: boolean
}

interface ApiHashtag {
    tag_name: string;
}

interface ApiDiscoveryResponse {
    suggested_users: ApiUser[];
    trending_hashtags: ApiHashtag[];
}

export const fetchDiscoveryData = createAsyncThunk<
    DiscoveryData,
    void,
    { rejectValue: string }
>(
    'search/fetchDiscoveryData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api('/discover', {
                method: 'GET',
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to fetch discovery data.');
            }

            const data: ApiDiscoveryResponse = await response.json();

            const transformedData: DiscoveryData = {
                suggestedUsers: data.suggested_users.map(user => ({
                    bio: user.bio,
                    displayName: user.display_name,
                    isFollowing: user.is_following,
                    profilePictureUrl: user.profile_picture_url,
                    username: user.username,
                    isSelf: user.is_self
                })),
                trendingTopics: data.trending_hashtags.map(hashtag => hashtag.tag_name),
            };
            return transformedData;
            
        } catch (error: any) {
            return rejectWithValue(error.message || 'An unknown network error occurred.');
        }
    }
);