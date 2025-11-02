/**
 * src/slices/messaging/conversationsSlice.ts
 * Redux slice for managing the list of user conversations.
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ConversationData, ConversationsState, LastMessagePreview } from "../../types/conversationType";
import { fetchConversations } from "../../thunks/messaging/fetchConversationsThunk";
import { logoutUser } from "../../thunks/authThunks/logoutThunk";

interface UpdatePreviewPayload {
    conversationId: string;
    message: Partial<LastMessagePreview>;
    isNewUnreadMessage: boolean; // Our new flag
}

// Define the initial state using the interface
const initialState: ConversationsState = {
    conversations: [],
    loading: 'idle',
    error: null,
};

const conversationsSlice = createSlice({
    name: "conversations",
    initialState,
    // Standard reducers for direct state manipulation
    reducers: {
        // Action to clear conversations
        clearConversations: (state) => {
            state.conversations = [];
            state.loading = 'idle';
            state.error = null;
        },
        updateConversationPreview: (state, action: PayloadAction<UpdatePreviewPayload>) => {
            const { conversationId, message, isNewUnreadMessage } = action.payload;
            const index = state.conversations.findIndex(c => c.id === conversationId);

            if (index !== -1) {
                // Get the conversation
                const convo = state.conversations[index];

                // Update last message
                const currentLastMessage = convo.lastMessage;
                convo.lastMessage = {
                    content: message.content !== undefined ? message.content : (currentLastMessage?.content ?? null),
                    senderUsername: message.senderUsername !== undefined ? message.senderUsername : (currentLastMessage?.senderUsername ?? null),
                    createdAt: message.createdAt !== undefined ? message.createdAt : (currentLastMessage?.createdAt ?? null),
                };

                // --- 3. ADD THIS LOGIC ---
                // If it's a new unread message, increment the count
                if (isNewUnreadMessage) {
                    convo.unreadCount = (convo.unreadCount || 0) + 1;
                }

                // Move the updated conversation to the top
                const updatedConvo = state.conversations.splice(index, 1)[0];
                state.conversations.unshift(updatedConvo);
            }
        },

        // Clears the count for a specific conversation
        markConversationAsRead: (state, action: PayloadAction<string>) => {
            const conversationId = action.payload;
            const convo = state.conversations.find(c => c.id === conversationId);
            if (convo) {
                convo.unreadCount = 0;
            }
        },

    },
    // Handle async actions, particularly fetching the conversation list
    extraReducers: (builder) => {
        builder
            // --- Handle clearing state on logout ---
            .addCase(logoutUser.fulfilled, (state) => {
                state.conversations = [];
                state.loading = 'idle';
                state.error = null;
            })

            // --- Handle fetching conversations ---
            .addCase(fetchConversations.pending, (state) => {
                state.loading = 'pending';
                state.error = null; // Clear previous errors
            })
            .addCase(fetchConversations.fulfilled, (state, action: PayloadAction<ConversationData[]>) => {
                state.loading = 'succeeded';
                state.conversations = action.payload.map(convo => ({
                    ...convo,
                    unreadCount: convo.unreadCount || 0 // Ensure it's never undefined
                }));
                state.error = null;
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload ?? 'Failed to fetch conversations.';
            })
            ;
    },
});

// Export actions
export const { clearConversations, updateConversationPreview, markConversationAsRead } = conversationsSlice.actions;

// Export the reducer
export default conversationsSlice.reducer;