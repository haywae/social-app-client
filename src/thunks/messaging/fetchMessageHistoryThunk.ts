/**
 * src/thunks/messagingThunks/fetchMessageHistoryThunk.ts
 * Async thunk for fetching the message history for a specific conversation.
 */
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { MessageData, MessagePagination } from "../../types/messageType"; 
import api from "../../apiInterceptor";
import type { RootState } from "../../store";
import { DEVELOPER_MODE } from "../../appConfig";

// Define the arguments required by the thunk
interface FetchHistoryArgs {
    conversationId: string; // The public_id of the conversation
    page?: number; // Optional page number (defaults to 1 server-side or here)
    perPage?: number; // Optional items per page (defaults server-side or here)
}

// Define the shape of the successful response payload
export interface FetchHistoryResponse {
    messages: MessageData[];
    pagination: MessagePagination;
    // Include conversationId to ensure the slice updates the correct state
    conversationId: string; 
}

/**
 * Fetches a paginated history of messages for a given conversation ID.
 */
export const fetchMessageHistory = createAsyncThunk<
    FetchHistoryResponse, // Return type on success
    FetchHistoryArgs, // Argument type
    { 
      state: RootState; 
      rejectValue: string; // Type for error payload
    }
>(
    'messages/fetchHistory',
    async ({ conversationId, page = 1, perPage = 30 }, { rejectWithValue, getState }) => {
        // Optional: Check if already loading for this conversation to prevent duplicate requests
        const { loading, activeConversationId } = getState().messages;
        if (loading === 'pending' && activeConversationId === conversationId) {
            // Can optionally reject or return a specific value indicating loading
            // return rejectWithValue('Already fetching messages for this conversation.'); 
            DEVELOPER_MODE && console.log("Already fetching message history for:", conversationId);
            // Or just return silently - depends on desired UX
            // For now, let's allow potential refetch if needed, API/slice handles state update.
        }

        try {
            // Construct the URL with query parameters for pagination
            const url = `/conversations/${conversationId}/messages?page=${page}&per_page=${perPage}`;
            
            // Use the api interceptor
            const response = await api(url, {
                method: 'GET',
            });

            if (!response.ok) {
                let errorMsg = 'Failed to fetch message history.';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData?.message || errorMsg;
                } catch (parseError) { /* Ignore */ }
                
                // Check specifically for 403 Forbidden (PermissionDeniedError on backend)
                if (response.status === 403) {
                     errorMsg = "You don't have permission to view these messages.";
                }
                // Check for 404 Not Found (ConversationNotFoundError on backend)
                 if (response.status === 404) {
                     errorMsg = "Conversation not found.";
                }
                
                return rejectWithValue(errorMsg);
            }

            // Parse the successful JSON response (expecting { messages: [], pagination: {} })
            const responseData: FetchHistoryResponse = await response.json();
            
            // Return the fetched data along with the conversationId
            return { 
                messages: responseData.messages, 
                pagination: responseData.pagination,
                conversationId: conversationId // Pass this back to the reducer
            };

        } catch (error: any) {
            DEVELOPER_MODE &&console.error("Error fetching message history:", error);
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);