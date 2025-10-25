import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { fetchComments } from "../../thunks/commentsThunks/fetchCommentsThunk";
import { createComment } from "../../thunks/commentsThunks/createCommentThunk";
import { deleteComment } from "../../thunks/commentsThunks/deleteCommentThunk";
import { updateComment } from "../../thunks/commentsThunks/updateCommentThunk";
import { fetchSingleComment } from "../../thunks/commentsThunks/fetchSingleCommentThunk";
import { toggleCommentLike } from "../../thunks/commentsThunks/toggleCommentLikeThunk";
import { fetchPosts } from "../../thunks/postsThunks/fetchPostsThunk";
import { uploadProfilePicture } from "../../thunks/settingsThunks/uploadProfilePictureThunk";

import { flattenComments, } from "../../utils/commentUtils";
import { type DeleteCommentFulfilledPayload } from "../../thunks/commentsThunks/deleteCommentThunk";
import { type CommentsState, type CommentData, type PaginatedCommentsResponse} from "../../types/commentType";

const initialState: CommentsState = {
    commentsById: {},
    topLevelCommentIds: [],
    replyIdsByParentId: {},
    paginationByParentId: {},
    parentComment: null,
    loading: 'idle',
    error: null,
    currentPage: 0,
    totalPages: 1,
};

/**
 * A Redux slice for managing the state of comments and their associated operations.
 * This slice includes reducers and extra reducers to handle actions such as:
 * - Fetching top-level comments and replies.
 * - Creating new comments or replies.
 * - Deleting comments and their associated replies.
 * - Toggling the like status of a comment.
 * - Updating existing comments.
 * - Normalizing and maintaining a structured state for efficient access, including:
 *   - A lookup table for comments by their IDs.
 *   - Arrays for top-level comment IDs and reply IDs grouped by parent comment.
 * - Managing loading states, pagination, and error handling for asynchronous operations.
 */
const commentsSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {
        clearComments: (state) => {
            Object.assign(state, initialState);
        },
        incrementReplyCount: (state, action: PayloadAction<{ commentId: string }>) => {
            const comment = state.commentsById[action.payload.commentId]
            if (comment) {
                comment.replyCount += 1;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // ================================
            // === FETCH TOP-LEVEL COMMENTS ===
            // ================================
            .addCase(fetchComments.pending, (state) => {
                state.loading = 'pending';
            })
            .addCase(fetchComments.fulfilled, (state, action: PayloadAction<PaginatedCommentsResponse>) => {
                state.loading = 'succeeded';
                // 1. --- Flatten all comments into a single array
                const flatCommentList = flattenComments(action.payload.comments);

                // 2. --- Reset comment and replies state for the first page
                if (action.payload.currentPage === 1) {
                    state.commentsById = {};
                    state.topLevelCommentIds = [];
                    state.replyIdsByParentId = {};
                }
                // 3. --- Populate the normalized state from the flattened list
                flatCommentList.forEach(comment => {
                    // --- a. Add every comment to the main lookup table
                    state.commentsById[comment.id] = comment;

                    // --- b. If the comment has a parent, it's a reply
                    if (comment.parentId) {
                        // --- i. If the parent has not been added as a key to replyIds, Add it with an empty array value
                        if (!state.replyIdsByParentId[comment.parentId]) {
                            state.replyIdsByParentId[comment.parentId] = [];
                        }
                        // --- ii. If the parent does not already have the new comment among its array of replies, Add it
                        if (!state.replyIdsByParentId[comment.parentId].includes(comment.id)) {
                            state.replyIdsByParentId[comment.parentId].push(comment.id);
                        }
                    }else{
                    // --- c. The comment is a top-level comment
                        // --- i. If the array of top level comments does not have the new comment, add it
                        if (!state.topLevelCommentIds.includes(comment.id)){
                            state.topLevelCommentIds.push(comment.id);
                        }
                    }
                })
                state.currentPage = action.payload.currentPage;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload ?? 'Failed to load comments.';
            })
            // =====================================
            // === CREATE A NEW COMMENT OR REPLY ===
            // =====================================
            .addCase(createComment.fulfilled, (state, action: PayloadAction<CommentData>) => {
                // --- 1. Declare the thunk response as a new comment
                const newComment = action.payload;
                state.commentsById[newComment.id] = newComment;

                // --- 2. If the comment has a parent, then it's a reply ---
                if (newComment.parentId) {
                    // --- a. If the new comment is not present in the array of replies ---
                    if (!state.replyIdsByParentId[newComment.parentId]) {
                        state.replyIdsByParentId[newComment.parentId] = [];
                    }
                    // --- b. Create a new parent-id key for the reply and push it inside the newly created array ---
                    state.replyIdsByParentId[newComment.parentId].push(newComment.id);
                    const parentComment = state.commentsById[newComment.parentId];

                    // --- c. If the parent comment is in the main lookup ---
                    if (parentComment) {
                        // Increase its count by 1
                        parentComment.replyCount += 1;
                    }
                } else {
                // --- 3. If the comment is a top-level comment
                    // --- a. Add it to the array of top-level comments
                    if (!state.topLevelCommentIds.includes(newComment.id)) {
                        state.topLevelCommentIds.unshift(newComment.id);
                    }
                }
            })
            // ========================
            // === DELETE A COMMENT ===
            // ========================
            .addCase(deleteComment.fulfilled, (state, action: PayloadAction<DeleteCommentFulfilledPayload>) => {
                // --- 1. Declare the newly deleted Comment and its parent ID(if it exists) ---
                const { deletedCommentId, parentId } = action.payload;

                // --- 2. All affected IDs to be delete from the redux store starting with the deleted comment ID ---
                const allIdsToDelete = [deletedCommentId];

                // --- 3. Queue to organize the extraction of IDs what will be deleted ---
                const queue = [deletedCommentId]; 

                // --- 4. Start the extraction loop until the queue is empty ---
                while(queue.length > 0) {
                    const currentId = queue.shift(); // Extract the first ID on the queue
                    if (currentId) {
                        const children = state.replyIdsByParentId[currentId] || []; // All the replies belonging to the comment
                        allIdsToDelete.push(...children); // Add all children of the comment to the deletion array
                        queue.push(...children); // Add the children to the Extraction queue, repeat extraction process until end
                    }
                }
                
                // --- 5. Remove all comments and replies from the lookup table ---
                allIdsToDelete.forEach(id => {
                    delete state.commentsById[id];
                    delete state.replyIdsByParentId[id];
                });

                // --- 6. If the comment had a parent ---
                if (parentId) {
                    // --- a. Remove the comment from the list of replies it's parent has ---
                    state.replyIdsByParentId[parentId] = (state.replyIdsByParentId[parentId] || []).filter(id => id !== deletedCommentId);
                    // --- b. Reduce the reply count of its parent
                    const parentComment = state.commentsById[parentId];
                    if (parentComment) {
                        parentComment.replyCount -= 1;
                    }
                } else {
                // --- 7. If it has no parent then it is a top level comment, remove it among the array of top-level comments
                    state.topLevelCommentIds = state.topLevelCommentIds.filter(id => id !== deletedCommentId);
                }
            })
            // ===================
            // === TOGGLE LIKE ===
            // ===================
            .addCase(toggleCommentLike.pending, (state, action) => {
                const comment = state.commentsById[action.meta.arg.commentId];
                if (comment) {
                    comment.isLiked = !comment.isLiked;
                    comment.likeCount += comment.isLiked ? 1 : -1;
                }
            })
            .addCase(toggleCommentLike.rejected, (state, action) => {
                const comment = state.commentsById[action.meta.arg.commentId];
                if (comment) { 
                    comment.isLiked = !comment.isLiked;
                    comment.likeCount += comment.isLiked ? 1 : -1;
                }
            })
            // ======================
            // === UPDATE COMMENT ===
            // ======================
            .addCase(updateComment.fulfilled, (state, action: PayloadAction<CommentData>) => {
                // To prevent losing reply info, we merge the update
                const updatedComment = action.payload;
                if (state.commentsById[updatedComment.id]) {
                    Object.assign(state.commentsById[updatedComment.id], updatedComment);
                }
            })
            // ============================
            // === FETCH SINGLE COMMENT ===
            // ============================
            .addCase(fetchSingleComment.pending, (state) => {
                state.loading = 'pending';
                state.commentsById = {};
                state.error = null;
            })
            .addCase(fetchSingleComment.fulfilled, (state, action: PayloadAction<CommentData>) => {
                state.loading = 'succeeded';

                state.commentsById[action.payload.id] = action.payload;
                state.error = null;
            })
            .addCase(fetchSingleComment.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload ?? 'Failed to fetch comment.';
            })

            // =========================================
            // === FETCH POST SIDE EFFECT ON COMMENT ===
            // =========================================
            .addCase(fetchPosts.fulfilled, (state, action) => {
                // Add the comments from the payload to the normalized state
                action.payload.comments.forEach(comment => {
                    if (!state.commentsById[comment.id]) {
                        state.commentsById[comment.id] = comment;
                    }
                });
            })
            .addCase(uploadProfilePicture.fulfilled, (state, action) => {
                const { username, profilePictureUrl } = action.payload;

                // Iterate over all comments in the lookup table
                Object.values(state.commentsById).forEach(comment => {
                    // If a comment's author matches the user...
                    if (comment.authorUsername === username) {
                        // ...update their avatar URL.
                        comment.authorAvatarUrl = profilePictureUrl;
                    }
                });
            });
    }
});

export const { clearComments, incrementReplyCount } = commentsSlice.actions;
export default commentsSlice.reducer;