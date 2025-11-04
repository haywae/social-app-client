/**
 * src/types/conversationTypes.ts
 * Defines the shape of conversation data used in the frontend state.
 */

// Represents the structure of the last message preview
export interface LastMessagePreview {
    content: string | null;
    senderUsername: string | null;
    createdAt: string | null; // ISO 8601 timestamp string
}

// Represents a single conversation in the list
export interface ConversationData {
    id: string; // The public_id of the conversation
    name: string; // Display name (e.g., other user's name or "Group Chat")
    imageUrl: string | null; // URL for the conversation's image (e.g., other user's avatar)
    lastMessage: LastMessagePreview | null; // Preview of the latest message
    participants: string[]; // Array of participant public_ids (UUID strings)
    unreadCount?: number;
    // updatedAt?: string; 
}

// Describes the structure of the conversations slice in the Redux store
export interface ConversationsState {
    conversations: ConversationData[]; // Array holding the conversation list
    loading: 'idle' | 'pending' | 'succeeded' | 'failed'; // Status of fetching conversations
    error: string | null; // Error message if fetching fails
    totalUnreadMessages: number;
    // Optional: Add pagination state if conversation list becomes very long
    // currentPage?: number;
    // totalPages?: number;
}