/**
 * src/thunks/messagingThunks/fetchConversationsThunk.ts
 * Async thunk for fetching the authenticated user's list of conversations.
 */
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { ConversationData } from "../../types/conversationType";
import api from "../../apiInterceptor";
import type { RootState } from "../../store"; 

/**
 * Fetches the user's conversation list from the API.
 * Requires the user to be authenticated (handled by apiInterceptor).
 */
export const fetchConversations = createAsyncThunk<
    ConversationData[], // Return type on success: Array of conversations
    void, // Argument type (none needed for this thunk)
    { 
      state: RootState; // Access to the Redux state if needed (optional)
      rejectValue: string; // Type for error payload
    }
>(
    'conversations/fetchConversations',
    async (_, { rejectWithValue }) => {
        try {
            // --- 1. Use the api interceptor which handles auth, CSRF from localStorage, etc.
            const response = await api('/conversations', {
                method: 'GET',
            });

            // --- 2. Check if the response is successful
            if (!response.ok) {
                // Try to parse error message from the API response
                let errorMsg = 'Failed to fetch conversations.';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData?.message || errorMsg;
                } catch (parseError) {
                    // Ignore if response body isn't JSON
                }
                // Reject with the error message
                return rejectWithValue(errorMsg);
            }

            // --- 3. Parse the successful JSON response (expecting an array)
            const conversations: ConversationData[] = await response.json();
            
            // --- 4. Returns the fetched conversations
            return conversations;

        } catch (error: any) {
            // Handle network errors or other unexpected issues
            console.error("Error fetching conversations:", error);
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);