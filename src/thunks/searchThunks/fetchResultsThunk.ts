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
    display_name: string;
    is_following: boolean;
    profile_picture_url: string;
    username: string;
    is_self: boolean
}

interface ApiPost {
    author: {
        display_name: string;
        profile_picture_url: string;
        username: string;
    };
    comment_count: number;
    content: string;
    created_at: string;
    is_liked_by_user: boolean;
    like_count: number;
    public_id: string;
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
            
            const transformedData: SearchResults = {
                users: data.users.map(user => ({
                    bio: user.bio,
                    displayName: user.display_name,
                    isFollowing: user.is_following,
                    profilePictureUrl: user.profile_picture_url,
                    username: user.username,
                    isSelf: user.is_self
                })),
                posts: data.posts.map(post => ({
                    author: {
                        displayName: post.author.display_name,
                        profilePictureUrl: post.author.profile_picture_url,
                        username: post.author.username,
                    },
                    commentCount: post.comment_count,
                    content: post.content,
                    createdAt: post.created_at,
                    isLikedByUser: post.is_liked_by_user,
                    likeCount: post.like_count,
                    publicId: post.public_id,
                })),
            };

            return transformedData;
        } catch (error: any) {
            return rejectWithValue(error.message || 'An unknown network error occurred.');
        }
    }
);