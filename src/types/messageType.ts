/**
 * src/types/messageTypes.ts
 * Defines the shape of message data used in the frontend state.
 */

// Represents the sender information embedded in a message
export interface MessageSender {
    id: string | null; // User's public_id (UUID string) or null if deleted
    username: string; // Username or "Deleted User"
    avatarUrl: string | null; // URL for the sender's profile picture
}

// Represents a single message object
export interface MessageData {
    id: string; // Message public_id (UUID string)
    conversationId: string; // Conversation public_id (UUID string)
    content: string | null; // Message text, null if soft-deleted
    isDeleted: boolean; // Flag for soft deletion
    createdAt: string; // ISO 8601 timestamp string
    sender: MessageSender;
    // Optional: Add temporary ID for optimistic UI updates
    // tempId?: string; 
}

// Describes the structure for pagination info returned by the API
export interface MessagePagination {
    page: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// Describes the structure of the messages slice in the Redux store
export interface MessagesState {
    messages: MessageData[]; // Array holding messages for the *active* conversation
    activeConversationId: string | null; // ID of the conversation currently being viewed
    pagination: MessagePagination | null; // Pagination info for the active conversation
    loading: 'idle' | 'pending' | 'succeeded' | 'failed'; // Status of fetching message history
    error: string | null; // Error message if fetching fails
}