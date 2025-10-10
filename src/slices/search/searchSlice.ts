import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { fetchDiscoveryData } from '../../thunks/searchThunks/fetchDiscoveryThunk';
import { fetchSearchResults } from '../../thunks/searchThunks/fetchResultsThunk';
import { followUser } from '../../thunks/userThunks/followUserThunk';
import { toggleLike } from '../../thunks/postsThunks/toggleLikeThunk';


// A helper function to update a user's follow status in our state arrays
export const updateUserFollowStatus = (state: SearchState, username: string) => {
    const updateUser = (user: UserSearchResult) => {
        if (user.username === username) {
            // Optimistically toggle the follow status
            user.isFollowing = !user.isFollowing;
        }
        return user;
    };
    state.suggestedUsers = state.suggestedUsers.map(updateUser);
    state.results.users = state.results.users.map(updateUser);
};
// --- Type Definitions ---

export interface UserSearchResult {
    bio?: string;
    displayName: string;
    isFollowing: boolean;
    profilePictureUrl: string;
    username: string;
    isSelf:boolean
}

export interface PostSearchResult {
    author: {
        displayName: string;
        profilePictureUrl: string;
        username: string;
    };
    commentCount: number;
    content: string;
    createdAt: string; // ISO 8601 date string
    isLikedByUser: boolean;
    likeCount: number;
    publicId: string;
}

interface SearchState {
    searchTerm: string;
    submittedSearchTerm: string;
    suggestedUsers: UserSearchResult[];
    trendingTopics: string[];
    results: {
        users: UserSearchResult[];
        posts: PostSearchResult[];
    };
    activeTab: 'posts' | 'users';
    discoveryLoading: 'idle' | 'pending' | 'succeeded' | 'failed';
    resultsLoading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error: string | null;
}

// --- Initial State ---
const initialState: SearchState = {
    searchTerm: '',
    submittedSearchTerm: '',
    suggestedUsers: [],
    trendingTopics: [],
    results: {
        users: [],
        posts: [],
    },
    activeTab: 'posts',
    discoveryLoading: 'idle',
    resultsLoading: 'idle',
    error: null,
};

// --- Slice Definition ---
const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setSearchTerm: (state, action: PayloadAction<string>) => {
            state.searchTerm = action.payload;
            state.submittedSearchTerm = '';
        },
        submitSearch: (state, action: PayloadAction<string|undefined>) => {
            if (action.payload){
                state.searchTerm = action.payload;
                state.submittedSearchTerm = action.payload;
            } else{
                state.submittedSearchTerm = state.searchTerm;
            }
        },
        clearSubmission: (state) => {
            state.submittedSearchTerm = '';
        },
        setActiveTab: (state, action: PayloadAction<'users' | 'posts'>) => {
            state.activeTab = action.payload;
        },
        clearSearchResults: (state) => {
            state.results = { users: [], posts: [] };
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // --- Handlers for Discovery Data ---
        builder
            .addCase(fetchDiscoveryData.pending, (state) => {
                state.discoveryLoading = 'pending';
            })
            .addCase(fetchDiscoveryData.fulfilled, (state, action) => {
                state.discoveryLoading = 'succeeded';
                state.suggestedUsers = action.payload.suggestedUsers;
                state.trendingTopics = action.payload.trendingTopics;
            })
            .addCase(fetchDiscoveryData.rejected, (state, action) => {
                state.discoveryLoading = 'failed';
                state.error = action.payload ?? 'Failed to load discovery data.';
            })
            // --- Handlers for Search Results ---
            .addCase(fetchSearchResults.pending, (state) => {
                state.resultsLoading = 'pending';
                state.error = null;
                // state.suggestedUsers = [];
                // state.trendingTopics = [];
            })
            .addCase(fetchSearchResults.fulfilled, (state, action) => {
                state.resultsLoading = 'succeeded';
                state.results.users = action.payload.users;
                state.results.posts = action.payload.posts;
            })
            .addCase(fetchSearchResults.rejected, (state, action) => {
                state.resultsLoading = 'failed';
                state.error = action.payload ?? 'Search failed.';
            })
            .addCase(followUser.pending, (state, action) => {
                // --- Optimistic Update ---
                // The UI is updated immediately, assuming success.
                const { username } = action.meta.arg;
                updateUserFollowStatus(state, username);
            })
            .addCase(followUser.rejected, (state, action) => {
                // --- Revert on Failure ---
                // If the API call fails, we revert the optimistic update.
                const { username } = action.meta.arg;
                console.error("Follow action failed:", action.payload);
                updateUserFollowStatus(state, username); // Toggle it back
            })
            .addCase(toggleLike.pending, (state, action) => {
                // Find the post within the search results
                const post = state.results.posts.find(p => p.publicId === action.meta.arg.postId);
                
                if (post) {
                    // Perform the same optimistic update here
                    post.isLikedByUser = !post.isLikedByUser;
                    post.likeCount += post.isLikedByUser ? 1 : -1;
                }
            })
            .addCase(toggleLike.rejected, (state, action) => {
                // If the API call fails, revert the change in the search results
                const post = state.results.posts.find(p => p.publicId === action.meta.arg.postId);

                if (post) {
                    post.isLikedByUser = !post.isLikedByUser;
                    post.likeCount += post.isLikedByUser ? 1 : -1;
                }
            });
    },
});

export const { setSearchTerm, setActiveTab, clearSearchResults, submitSearch, clearSubmission } = searchSlice.actions;
export default searchSlice.reducer;