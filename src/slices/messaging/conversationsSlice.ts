/**
 * src/slices/messaging/conversationsSlice.ts
 * Redux slice for managing the list of user conversations.
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ConversationData, ConversationsState, LastMessagePreview } from "../../types/conversationType";
import { fetchConversations } from "../../thunks/messaging/fetchConversationsThunk";
import { logoutUser } from "../../thunks/authThunks/logoutThunk";
import { deleteConversation } from "../../thunks/messaging/deleteConversationThunk";
import { createConversation } from "../../thunks/messaging/createConversationThunk";
import { DEVELOPER_MODE } from "../../appConfig";

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
    totalUnreadMessages: 0,
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
            state.totalUnreadMessages = 0;
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
                    state.totalUnreadMessages = (state.totalUnreadMessages || 0) + 1;
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
                const oldUnreadCount = convo.unreadCount || 0;
                state.totalUnreadMessages -= oldUnreadCount
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
                state.totalUnreadMessages = 0;
            })

            .addCase(createConversation.fulfilled, (state, action: PayloadAction<ConversationData>) => {
                const newConversation = action.payload;

                // Check if the conversation already exists in our list
                const existingIndex = state.conversations.findIndex(
                    convo => convo.id === newConversation.id
                );

                if (existingIndex !== -1) {
                    // It already exists, just move it to the top
                    const existingConvo = state.conversations.splice(existingIndex, 1)[0];
                    state.conversations.unshift(existingConvo);
                } else {
                    // It's a brand new conversation, add it to the top
                    state.conversations.unshift(newConversation);
                }
                
                // Ensure loading state is set to 'succeeded'
                state.loading = 'succeeded';
            })

            // --- Handle fetching conversations ---
            .addCase(fetchConversations.pending, (state) => {
                state.loading = 'pending';
                state.error = null; // Clear previous errors
            })
            .addCase(fetchConversations.fulfilled, (state, action: PayloadAction<ConversationData[]>) => {
                state.loading = 'succeeded';
                const conversations = action.payload.map(convo => ({
                    ...convo,
                    unreadCount: convo.unreadCount || 0 // Ensure it's never undefined
                }));

                state.conversations = conversations

                state.totalUnreadMessages = conversations.reduce(
                    (total, convo) => total + (convo.unreadCount || 0),
                    0
                );
                state.error = null;
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload ?? 'Failed to fetch conversations.';
            })
            .addCase(deleteConversation.fulfilled, (state, action) => {
                // Optimistically remove the conversation from the list
                const { conversationId } = action.payload;
                state.conversations = state.conversations.filter(
                    convo => convo.id !== conversationId
                );
            })
            .addCase(deleteConversation.rejected, (_, action) => {
                // On failure, we could show an error, but for now we'll just log it.
                // The conversation will have already been removed from the UI.
                // It will reappear on the next app refresh/fetch.
                DEVELOPER_MODE && console.error("Failed to delete conversation:", action.payload);
            });
            ;
    },
});

// Export actions
export const { clearConversations, updateConversationPreview, markConversationAsRead } = conversationsSlice.actions;

// Export the reducer
export default conversationsSlice.reducer;