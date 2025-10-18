import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../appConfig';
import type { UserSearchResult, PostSearchResult } from '../../slices/search/searchSlice';
import api from '../../apiInterceptor';
import { type RootState } from '../../store';

// Interface for the data structure we want in our Redux store
interface SearchResults {
    users: UserSearchResult[];
    posts: PostSearchResult[];
}

// Interfaces for the raw API response
interface ApiUser {
    bio: string;
    displayName: string;
    isFollowing: boolean;
    profilePictureUrl: string;
    username: string;
    isSelf: boolean
}

interface ApiPost {
    author: {
        displayName: string;
        profilePictureUrl: string;
        username: string;
    };
    commentCount: number;
    content: string;
    createdAt: string;
    isLikedByUser: boolean;
    likeCount: number;
    publicId: string;
    hashtags: string[];
    postType: 'REGULAR' | 'RATE_POST';
}

interface ApiSearchResponse {
    users: ApiUser[];
    posts: ApiPost[];
}

export const fetchSearchResults = createAsyncThunk<
    SearchResults,
    string,
    { state: RootState, rejectValue: string }
>(
    'search/fetchSearchResults',
    async (searchTerm, { getState, rejectWithValue }) => {
        if (!searchTerm) {
            return { users: [], posts: [] };
        }

        // Check authentication status from the Redux store
        const { isAuthenticated } = getState().auth;
        const url = `/search?q=${encodeURIComponent(searchTerm)}`;

        try {
            let response: Response;

            if (isAuthenticated) {
                // If logged in, use the 'api' service for automatic token handling
                response = await api(url, {
                    method: 'GET',
                });
            } else {
                // If logged out, use a standard anonymous fetch
                response = await fetch(`${API_BASE_URL}${url}`, {
                    method: 'GET',
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || `Search failed for "${searchTerm}"`);
            }

            const data: ApiSearchResponse = await response.json();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'An unknown network error occurred.');
        }
    }
);