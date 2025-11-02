/**
 * src/thunks/messaging/createConversationThunk.ts
 */
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import type { RootState } from "../../store";
import type { ConversationData } from "../../types/conversationType";
import { setActiveConversation } from "../../slices/messaging/messageSlice";
import { fetchConversations } from "./fetchConversationsThunk";

interface CreateConvoArgs {
    username: string;
}

/**
 * Finds or creates a 1-on-1 conversation with a target user.
 * On success, it dispatches an action to refresh the conversation list
 * and set the new conversation as active.
 */
export const createConversation = createAsyncThunk<
    ConversationData, // Return type on success
    CreateConvoArgs,    // Argument type
    { 
      state: RootState; 
      rejectValue: string; 
    }
>(
    'conversations/create',
    async ({ username }, { rejectWithValue, dispatch }) => {
        try {
            const response = await api('/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData?.message || 'Failed to start conversation.');
            }

            const newConversation: ConversationData = await response.json();
            
            // --- Success ---
            // 1. Refresh the entire conversation list to include the new chat
            dispatch(fetchConversations()); 

            // 2. Immediately set this new conversation as active
            dispatch(setActiveConversation(newConversation.id));

            return newConversation;

        } catch (error: any) {
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);