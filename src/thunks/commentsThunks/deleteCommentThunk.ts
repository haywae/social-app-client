import { createAsyncThunk } from '@reduxjs/toolkit';
import { type RootState } from '../../store';
import api from '../../apiInterceptor';

/**
 * Represents the arguments required to delete a comment.
 * 
 * @interface DeleteCommentArgs
 * @property {string} commentId - The unique identifier of the comment to be deleted.
 * @property {string} postId - The unique identifier of the post containing the comment.
 */
interface DeleteCommentArgs {
    commentId: string;
    postId: string; 
}


/**
 * Represents the payload for a successfully deleted comment.
 *
 * @interface DeleteCommentFulfilledPayload
 * @property {string} deletedCommentId - The unique identifier of the comment that was deleted.
 * @property {string | null} parentId - The unique identifier of the parent comment, if the deleted comment was a reply. 
 *                                      If the deleted comment was not a reply, this will be `null`.
 */
export interface DeleteCommentFulfilledPayload {
    deletedCommentId: string;
    parentId: string | null;
}


/**
 * Defines an asynchronous Redux thunk for deleting an existing comment.
 *
 * @param {DeleteCommentArgs} { commentId } - The arguments for deleting a comment.
 * @returns {Promise<DeleteCommentFulfilledPayload>} A promise that resolves with the ID of the deleted comment
 *                                                    and its parent ID (if it was a reply).
 */

export const deleteComment = createAsyncThunk<
    DeleteCommentFulfilledPayload,
    DeleteCommentArgs,
    { state: RootState; rejectValue: string }
>(
    'comments/deleteComment',
    async ({ commentId }, { getState, rejectWithValue }) => {
        // 1. Retrieve the parentId from the Redux store before the API call.
        const commentToDelete = getState().comments.commentsById[commentId];
        const parentId = commentToDelete ? commentToDelete.parentId : null;

        try {
            // 2. Make the request using the api service.
            // The service automatically handles the CSRF token.
            const response = await api(`/comments/${commentId}`, {
                method: 'DELETE',
            });

            // 3. Handle any non-successful responses.
            // response.ok is true for statuses 200-299, which includes 204.
            if (!response.ok) {
                // Try to parse error message, but handle cases where body is empty
                try {
                    const errorData = await response.json();
                    return rejectWithValue(errorData.message || 'Failed to delete comment.');
                } catch (e) {
                    return rejectWithValue(`Failed to delete comment (Status: ${response.status})`);
                }
            }

            // 4. On any successful response (200 or 204), return the required payload.
            return { deletedCommentId: commentId, parentId };

        } catch (error: any) {
            // This catches network errors or errors from the interceptor (e.g., failed token refresh).
            return rejectWithValue(error.message);
        }
    }
);