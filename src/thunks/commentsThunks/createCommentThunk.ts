import { createAsyncThunk } from "@reduxjs/toolkit";
import { type CommentData, type ApiComment} from "../../types/commentType";
import type { RootState } from "../../store";
import api from "../../apiInterceptor";

interface CreateCommentArgs {
    postId: string;
    content: string;
    parent_id?: string | null; 
}

export const createComment = createAsyncThunk<
    CommentData,
    CreateCommentArgs,
    { state: RootState, rejectValue: string }
>(
    'comments/create',
    async ({ postId, content, parent_id }, { getState, rejectWithValue }) => {

        const { user } = getState().auth;
        if (!user) {
            return rejectWithValue('You must be logged in to comment.');
        }

        try {
            const response = await api(`/posts/${postId}/comments`, {
                method: 'POST',
                body: JSON.stringify({ content, parent_public_id: parent_id}),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to post comment.');
            }
            const apiResponse: ApiComment = await response.json();

            // Transform the snake_case API response to our camelCase CommentData
            const transformedComment: CommentData = {
                id: apiResponse.id,
                content: apiResponse.content,
                createdAt: apiResponse.created_at,
                parentId: apiResponse.parent_id,
                isLiked: apiResponse.is_liked || false,
                likeCount: apiResponse.like_count,
                replyCount: apiResponse.reply_count,
                authorName: apiResponse.user.displayName,
                authorUsername: apiResponse.user.username,
                authorAvatarUrl: apiResponse.user.profile_picture_url,
                postId: apiResponse.post_id
            };
            return transformedComment;
            
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);