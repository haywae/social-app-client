/**
 * src/thunks/messaging/markConversationReadThunk.ts (New File)
 */
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import type { RootState } from "../../store";
import { markConversationAsRead } from "../../slices/messaging/conversationsSlice";

/**
 * Marks all messages in a conversation as read.
 */
export const markConversationRead = createAsyncThunk<
    void, // Return type on success
    string, // Argument type (conversationId)
    { state: RootState; rejectValue: string }
>(
    'conversations/markAsRead',
    async (conversationId, { dispatch, rejectWithValue }) => {
        
        // --- 1. Optimistic Update ---
        // Immediately mark as read in the UI so it feels instant.
        dispatch(markConversationAsRead(conversationId));

        try {
            // --- 2. API Call ---
            const response = await api(`/conversations/${conversationId}/read`, {
                method: 'POST',
            });

            if (!response.ok) {
                const errorData = await response.json();
                // If it fails, we would ideally revert the optimistic update,
                // but for "marking as read," it's low-risk to just log the error.
                console.error("Failed to mark conversation as read on server:", errorData);
                return rejectWithValue(errorData?.message || 'Failed to mark as read.');
            }
            
            // Success, nothing more to do.
            
        } catch (error: any) {
            console.error("Error in markConversationRead thunk:", error);
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);