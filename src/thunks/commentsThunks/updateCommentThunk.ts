import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import { type CommentData } from "../../types/commentType";
import { transformApiComment } from "../../utils/commentUtils";

interface UpdateCommentArgs {
    commentId: string;
    content: string;
}

/**
 * Defines an asynchronous Redux thunk for updating an existing comment.
 *
 * @param {UpdateCommentArgs} { commentId, content, tags } - The arguments for updating a comment.
 * @returns {Promise<CommentData>} A promise that resolves with the updated comment data.
 */
export const updateComment = createAsyncThunk<
    CommentData,
    UpdateCommentArgs,
    { rejectValue: string }
>(
    'comments/update',
    async ({ commentId, content }, { rejectWithValue }) => {
        try {
            // 2. Make the request using the 'api' service.
            const response = await api(`/comments/${commentId}`, {
                method: 'PUT',
                body: JSON.stringify({ content }),
            });
            
            // 3. Handle non-successful responses.
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to update comment.');
            }

            const data = await response.json();
            // The transformation logic remains the same.
            return transformApiComment(data);

        } catch (error: any) {
            // This will catch network errors or errors from a failed token refresh.
            return rejectWithValue(error.message);
        }
    }
);
