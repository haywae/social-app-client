/**
 * @interface ApiComment
 * @description Defines the shape of a raw comment object as received from the Thunk. 
 * This interface represents the direct, unprocessed data structure from the backend.\
 * Note: The data has to be transformed by the transformCommentUtil
 * @property {string} id - The unique identifier for the comment.
 * @property {string} content - The text content of the comment.
 * @property {string} created_at - The ISO 8601 timestamp of when the comment was created.
 * @property {number} like_count - The total number of likes the comment has received.
 * @property {number} reply_count - The total number of direct replies to this comment.
 * @property {string | null} parent_id - The ID of the parent comment if this is a reply, otherwise null.
 * @property {object} user - Contains details about the comment's author.
 * @property {boolean} [is_liked] - Indicates if the current user has liked this comment (optional).
 * @property {ApiComment[]} [replies] - An array of nested reply comments (optional).
 */
export interface ApiComment {
    id: string;
    content: string;
    created_at: string;
    like_count: number;
    reply_count: number;
    parent_id: string | null;
    user: {
        profile_picture_url: string;
        username: string;
        displayName: string;
    };
    is_liked?: boolean;
    replies?: ApiComment[];
    post_id: string;
}


/**
 * @interface PaginatedCommentsResponse
 * @description Defines the shape of a paginated response for comments as received from the API.
 * @property {ApiComment[]} comments - An array of comment objects for the current page.
 * @property {number} totalItems - The total number of comments available across all pages.
 * @property {number} currentPage - The current page number in the paginated response.
 * @property {number} totalPages - The total number of pages available.
 */
export interface PaginatedCommentsResponse {
    comments: ApiComment[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
}

/**
 * @interface CommentData
 * @description Represents a normalized and flattened comment object, transformed for use within the client-side application state. This shape is easier to manage in a state store.
 * @property {string} id - The unique identifier for the comment.
 * @property {string} authorName - The display name of the comment's author.
 * @property {string} authorUsername - The unique username of the comment's author.
 * @property {string} authorAvatarUrl - The URL for the author's profile avatar.
 * @property {string} content - The text content of the comment.
 * @property {string} createdAt - The creation timestamp, potentially formatted for display.
 * @property {number} likeCount - The total number of likes.
 * @property {number} replyCount - The total number of replies.
 * @property {boolean} isLiked - Indicates if the current user has liked this comment.
 * @property {string | null} parentId - The ID of the parent comment if it is a reply.
 */
export interface CommentData {
    id: string;
    authorName: string;
    authorUsername: string;
    authorAvatarUrl: string;
    content: string;
    createdAt: string;
    likeCount: number;
    replyCount: number;
    isLiked: boolean;
    parentId: string | null;
    postId: string
}

/**
 * @interface CommentsState
 * @description Defines the shape of the comments slice in the application's state management store (e.g., Redux), using a normalized structure for efficient data access.
 * @property {Record<string, CommentData>} commentsById - A lookup table mapping a comment ID to its `CommentData`.
 * @property {string[]} topLevelCommentIds - An array of IDs for comments that are not replies.
 * @property {Record<string, string[]>} replyIdsByParentId - A lookup table mapping a parent comment ID to an array of its direct reply IDs.
 * @property {Record<string, { currentPage: number; totalPages: number }>} paginationByParentId - Manages the pagination state for the replies of each parent comment.
 * @property {'idle' | 'pending' | 'succeeded' | 'failed'} loading - The current asynchronous loading state for fetching comments.
 * @property {string | null} error - Stores an error message if a fetch operation fails.
 * @property {number} currentPage - The current page number for the list of top-level comments.
 * @property {number} totalPages - The total number of pages available for top-level comments.
 */
export interface CommentsState {
    commentsById: Record<string, CommentData>;
    topLevelCommentIds: string[];
    replyIdsByParentId: Record<string, string[]>;
    paginationByParentId: Record<string, { currentPage: number; totalPages: number }>;
    parentComment: CommentData | null;
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error: string | null;
    currentPage: number;
    totalPages: number;
}

