import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { createPost } from "../../thunks/postsThunks/createPostThunk";
import { deletePost } from "../../thunks/postsThunks/deletePostThunk";
import { updatePost } from "../../thunks/postsThunks/updatePostThunk";
import { fetchPosts} from "../../thunks/postsThunks/fetchPostsThunk";
import { fetchSinglePost } from "../../thunks/postsThunks/fetchSinglePostThunk";
import { fetchUserPosts } from "../../thunks/postsThunks/fetchUserPostsThunk";
import { toggleLike } from "../../thunks/postsThunks/toggleLikeThunk";
import { uploadProfilePicture } from "../../thunks/settingsThunks/uploadProfilePictureThunk";
import { type PostData, type FetchedPostsPayload } from "../../types/postType";
import { type UploadPayload } from "../../thunks/settingsThunks/uploadProfilePictureThunk";
/**
 * Defines the shape of the state for managing posts.
 */
interface PostsState {
    posts: PostData[];
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error: string | null;
    currentPage: number;
    totalPages: number;
    createPostContent: string;
    createPostStatus: 'idle' | 'succeeded' | 'failed'; // To track form submission success
}

/**
 * The initial state for the posts slice.
 */
const initialState: PostsState = {
    posts: [],
    loading: 'idle',
    error: null,
    currentPage: 0,
    totalPages: 1,
    createPostContent: '',
    createPostStatus: 'idle',
};


// / A matcher for when ANY of the post-fetching thunks are pending
const isFetchPostsPending = (action: PayloadAction) => {
    return action.type === fetchPosts.pending.type || action.type === fetchUserPosts.pending.type;
};
// A matcher for when ANY of the post-fetching thunks are fulfilled
const isFetchPostsFulfilled = (action: PayloadAction) => {
    return action.type === fetchPosts.fulfilled.type || action.type === fetchUserPosts.fulfilled.type;
};
// A matcher for when ANY of the post-fetching thunks are rejected
const isFetchPostsRejected = (action: PayloadAction) => {
    return action.type === fetchPosts.rejected.type || action.type === fetchUserPosts.rejected.type;
};

const postsSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {
        setCreatePostContent: (state, action: PayloadAction<string>) => {
            state.createPostContent = action.payload;
            state.createPostStatus = 'idle'; // Reset status when user types
            state.error = null; // Clear previous errors
        },
        resetCreatePostStatus: (state) => {
            state.createPostStatus = 'idle';
            state.error = null;
        }, 
        incrementCommentCount: (state, action: PayloadAction<{ postId: string }>) => {
            const post = state.posts.find(p => p.id === action.payload.postId);
            if (post) {
                post.replyCount += 1;
            }
        },
        clearPosts: (state) => {
            state.posts = [];
            state.currentPage = 0;
            state.totalPages = 1;
            state.loading = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // =================================
            // === Cases for Creating a Post ===
            // =================================
            .addCase(createPost.pending, (state) => {
                state.loading = 'pending';
                state.error = null; // Clear previous errors on a new attempt
                state.createPostStatus = 'idle';
            })
            .addCase(createPost.fulfilled, (state, action: PayloadAction<PostData>) => {
                state.loading = 'succeeded';
                // Add the new post to the beginning of the array for an instant UI update
                state.posts.unshift(action.payload);
                state.createPostContent = ''; 
                state.createPostStatus = 'succeeded';
            })
            .addCase(createPost.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload ?? 'Could not create post.';
                state.createPostStatus = 'failed';
            })
            // =================================
            // === Cases for Deleting a Post ===
            // =================================
            .addCase(deletePost.fulfilled, (state, action: PayloadAction<string>) => {
                // Filter out the deleted post by its ID
                state.posts = state.posts.filter(post => post.id !== action.payload);
                state.error = null;
            })
            .addCase(deletePost.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload ?? 'Could not delete post.';
            })
            // ================================
            // === Case for Updating a Post ===
            // ================================
            .addCase(updatePost.fulfilled, (state, action: PayloadAction<PostData>) => {
                const index = state.posts.findIndex(post => post.id === action.payload.id);
                if (index !== -1) {
                    // Replace the old post with the updated one
                    state.posts[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(updatePost.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload ?? 'Could not update post.';
            })
            // =======================================
            // === Case for Fetching a Single Post ===
            // =======================================
            .addCase(fetchSinglePost.pending, (state) => {
                state.loading = 'pending';
                state.posts = []; // Clear previous posts
                state.error = null;
            })
            .addCase(fetchSinglePost.fulfilled, (state, action: PayloadAction<PostData>) => {
                state.loading = 'succeeded';
                // Set the posts array to contain only the single fetched post
                state.posts = [action.payload];
                state.error = null;
            })
            .addCase(fetchSinglePost.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload ?? 'Could not fetch post.';
            })
            // =====================================
            // === Case for Toggling Like Status ===
            // =====================================
            .addCase(toggleLike.pending, (state, action) => {
                // Find the post that is being liked/unliked
                const post = state.posts.find(p => p.id === action.meta.arg.postId);
                if (post) {
                    // Optimistically update the UI immediately
                    post.isLiked = !post.isLiked;
                    post.likeCount += post.isLiked ? 1 : -1;
                }
                state.error = null;
            })
            .addCase(toggleLike.rejected, (state, action) => {
                // If the API call fails, revert the change
                const post = state.posts.find(p => p.id === action.meta.arg.postId);
                if (post) {
                    post.isLiked = !post.isLiked; // Toggle back
                    post.likeCount += post.isLiked ? 1 : -1; // Revert count
                }
                state.error = action.payload ?? 'Failed to update like status.';
            })
            .addCase(uploadProfilePicture.fulfilled, (state, action: PayloadAction<UploadPayload>) => {
                // Extract the username and new avatar URL from the action's payload
                const { username, profilePictureUrl } = action.payload;

                // Go through all the posts currently in the state
                state.posts.forEach(post => {
                    // If a post's author matches the user who updated their picture...
                    if (post.authorUsername === username) {
                        // ...update their avatar URL.
                        post.authorAvatarUrl = profilePictureUrl;
                    }
                });
            })
            // ==============================================================================
            // === Matches and handles cases for a Specific User's Feed and General Feeds ===
            // ==============================================================================
            .addMatcher(isFetchPostsFulfilled, (state, action: PayloadAction<FetchedPostsPayload>) => {
                state.loading = 'succeeded';
                // --- 1. Process incoming posts to extract comment preview IDs ---
                const incomingPosts = action.payload.posts.map(post => {
                    // --- a. Return the post object
                    return { ...post };
                });

                // --- 2. If it's the first page, REPLACE the posts array.
                if (action.payload.currentPage === 1) {
                    state.posts = incomingPosts;
                } else {
                // --- 3. For subsequent pages, APPEND new posts for infinite scroll.
                    // a. Create a Set of existing post IDs for a fast lookup.
                    const existingPostIds = new Set(state.posts.map(p => p.id));
                    // b. Filter the incoming posts to only include ones we haven't seen before.
                    const newPosts = incomingPosts.filter(p => !existingPostIds.has(p.id));

                    state.posts.push(...newPosts);
                }
                state.currentPage = action.payload.currentPage;
                state.totalPages = action.payload.totalPages;
                state.error = null;
            })
            .addMatcher(isFetchPostsPending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addMatcher(isFetchPostsRejected, (state, action: PayloadAction<string>) => {
                state.loading = 'failed';
                state.error = action.payload || 'Failed to fetch user posts.';
            })
    }
});

export const { clearPosts, setCreatePostContent, resetCreatePostStatus, incrementCommentCount } = postsSlice.actions;
export default postsSlice.reducer;
