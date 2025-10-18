import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apiInterceptor';
import type { UserSearchResult } from '../../slices/search/searchSlice';
import type { RootState } from '../../store'; 

// Interface for the data structure we want in our Redux store
interface DiscoveryData {
    suggestedUsers: UserSearchResult[];
    trendingTopics: string[];
}

interface ApiUser {
    bio: string;
    displayName: string;
    isFollowing: boolean;
    profilePictureUrl: string;
    username: string;
    isSelf: boolean
}

interface ApiHashtag {
    tagName: string;
}

interface ApiDiscoveryResponse {
    suggestedUsers: ApiUser[];
    trendingTopics: ApiHashtag[];
}

export const fetchDiscoveryData = createAsyncThunk<
    DiscoveryData,
    void,
    { state: RootState, rejectValue: string }
>(
    'search/fetchDiscoveryData',
    async (_, { getState, rejectWithValue }) => {
        try {
            const response = await api('/discover', {
                method: 'GET',
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to fetch discovery data.');
            }

            const data: ApiDiscoveryResponse = await response.json();

            // 1. Get the current user's username from the Redux state.
            const loggedInUsername = getState().auth.user?.username;

            // 2. Filter the suggested users to exclude the current user.
            const filteredSuggestedUsers = data.suggestedUsers.filter(
                user => user.username !== loggedInUsername
            );

            const transformedData: DiscoveryData = {
                suggestedUsers: filteredSuggestedUsers,
                trendingTopics: data.trendingTopics.map(hashtag => hashtag.tagName),
            };
            return transformedData;
            
        } catch (error: any) {
            return rejectWithValue(error.message || 'An unknown network error occurred.');
        }
    }
);