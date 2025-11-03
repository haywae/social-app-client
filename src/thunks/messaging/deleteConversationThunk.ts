/**
 * src/thunks/messaging/deleteConversationThunk.ts
 * Async thunk for "deleting" (hiding) a conversation.
 */
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import type { RootState } from "../../store";

// This is the payload we'll send to the reducer for optimistic update
interface DeleteConvoPayload {
    conversationId: string;
}

/**
 * Hides a conversation for the user.
 * Dispatches a success action with the conversationId
 * so the slice can optimistically remove it.
 */
export const deleteConversation = createAsyncThunk<
    DeleteConvoPayload, // Return type on success
    string,             // Argument type (conversationId)
    { 
      state: RootState; 
      rejectValue: string; 
    }
>(
    'conversations/delete',
    async (conversationId, { rejectWithValue }) => {
        try {
            const response = await api(`/conversations/${conversationId}`, {
                method: 'DELETE',
            });

            // 204 No Content is a success
            if (response.status === 204) {
                return { conversationId };
            }
            
            // Handle other potential errors
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData?.message || 'Failed to delete conversation.');
            }

            return { conversationId };

        } catch (error: any) {
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);