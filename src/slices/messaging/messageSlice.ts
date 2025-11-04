/**
 * src/slices/messaging/messagesSlice.ts
 * Redux slice for managing messages of the currently active conversation.
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MessageData, MessagesState } from "../../types/messageType"
import type { ConversationData } from "../../types/conversationType";
import { fetchMessageHistory, type FetchHistoryResponse } from "../../thunks/messaging/fetchMessageHistoryThunk";
import { createConversation } from "../../thunks/messaging/createConversationThunk";
import { logoutUser } from "../../thunks/authThunks/logoutThunk";

// Define the initial state
const initialState: MessagesState = {
    messages: [],
    activeConversationId: null,
    pagination: null,
    loading: 'idle',
    error: null,
};

const messagesSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        // Action to set the currently active conversation and clear old messages
        setActiveConversation: (state, action: PayloadAction<string | null>) => {
            // If setting a new conversation, clear previous messages and pagination
            if (state.activeConversationId !== action.payload) {
                state.messages = [];
                state.pagination = null;
                state.loading = 'idle';
                state.error = null;
            }
            state.activeConversationId = action.payload;
        },
        // Action called by socketService when a new message event is received
        addMessage: (state, action: PayloadAction<MessageData>) => {
            const newMessage = action.payload;
            // Only add the message if it belongs to the currently active conversation
            // and isn't already present (prevents duplicates from include_self=True)
            if (newMessage.conversationId === state.activeConversationId &&
                !state.messages.some(msg => msg.id === newMessage.id)) {
                // Add to the end (assuming chronological order)
                // For chat UIs, you often prepend to the start if sorted newest first
                state.messages.push(newMessage);
                // Alternatively, prepend: state.messages.unshift(newMessage);
            }
        },
        // Action to clear messages, e.g., on logout or leaving chat view
        clearMessages: (state) => {
            state.messages = [];
            state.activeConversationId = null;
            state.pagination = null;
            state.loading = 'idle';
            state.error = null;
        },
        // Placeholder for optimistic updates (add message immediately with temp ID)
        // addOptimisticMessage: (state, action: PayloadAction<MessageData>) => { ... }
        // Placeholder for confirming/replacing optimistic message when server confirms
        // confirmOptimisticMessage: (state, action: PayloadAction<{ tempId: string, confirmedMessage: MessageData }>) => { ... }
    },
    extraReducers: (builder) => {
        builder
            // --- Handle clearing state on logout ---
            .addCase(logoutUser.fulfilled, (state) => {
                state.messages = [];
                state.activeConversationId = null;
                state.pagination = null;
                state.loading = 'idle';
                state.error = null;
            })

            // --- Handle fetching message history (Placeholder for thunk) ---
            // --- 2. Handle fetchMessageHistory lifecycle ---
            .addCase(fetchMessageHistory.pending, (state, action) => {
                // Only set loading if fetching for the *currently active* conversation
                // Prevents loading indicator flicker if user switches chats quickly
                if (action.meta.arg.conversationId === state.activeConversationId) {
                    state.loading = 'pending';
                    state.error = null; // Clear previous errors for this specific fetch
                }
            })
            .addCase(fetchMessageHistory.fulfilled, (state, action: PayloadAction<FetchHistoryResponse>) => {
                if (action.payload.conversationId === state.activeConversationId) {
                    state.loading = 'succeeded';
                    
                    const existingIds = new Set(state.messages.map(m => m.id));
                    
                    // 1. Filter out duplicates
                    const uniqueNewMessages = action.payload.messages.filter(m => !existingIds.has(m.id));
                    
                    // 2. REVERSE the incoming [Newest...Oldest] array
                    //    to be [Oldest...Newest] before prepending.
                    const correctlyOrderedMessages = uniqueNewMessages.reverse();

                    // 3. Prepend the correctly ordered chunk
                    state.messages = [...correctlyOrderedMessages, ...state.messages];

                    state.pagination = action.payload.pagination;
                    state.error = null;
                }
            })
            .addCase(fetchMessageHistory.rejected, (state, action) => {
                // Only set error if it relates to the active conversation
                if (action.meta.arg.conversationId === state.activeConversationId) {
                    state.loading = 'failed';
                    state.error = action.payload ?? 'Failed to fetch messages.';
                }
            })
            .addCase(createConversation.fulfilled, (state, action: PayloadAction<ConversationData>) => {
                // Set this new conversation as the active one
                state.activeConversationId = action.payload.id;
                // Clear out any messages from the previously viewed chat
                state.messages = [];
                state.pagination = null;
                state.loading = 'idle';
                state.error = null;
            });
    },
});


export const { setActiveConversation, addMessage, clearMessages } = messagesSlice.actions;

export default messagesSlice.reducer;