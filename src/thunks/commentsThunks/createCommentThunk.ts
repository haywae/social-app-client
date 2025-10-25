import { createAsyncThunk } from "@reduxjs/toolkit";
import { type CommentData } from "../../types/commentType";
import type { RootState } from "../../store";
import api from "../../apiInterceptor";

interface CreateCommentArgs {
    postId: string; 
    content: string;
    parent_id?: string | null; 
}

export const createComment = createAsyncThunk<
    CommentData, // Api Response Type
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
            const apiResponse: CommentData = await response.json();

            return apiResponse;
            
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);