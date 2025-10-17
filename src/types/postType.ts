import { type CommentData, type ApiComment } from "./commentType";

/**
 * @interface FetchedPostsPayload
 * @description The definitive payload shape returned by post-fetching thunks. It bundles the posts for the current page, all associated comment previews for normalization, and the necessary pagination metadata.
 * @property {PostData[]} posts - An array of processed post data for the current page.
 * @property {CommentData[]} comments - A flattened array of all comments associated with the fetched posts.
 * @property {number} currentPage - The current page number of the paginated post list.
 * @property {number} totalPages - The total number of pages available for the posts.
 */
export interface FetchedPostsPayload {
    posts: PostData[];
    comments: CommentData[];
    currentPage: number;
    totalPages: number;
}


/**
 * @interface PostData
 * @description Represents a single post after it has been processed and normalized for the frontend application state.
 * @property {string} id - The unique identifier for the post.
 * @property {string} authorName - The display name of the post's author.
 * @property {string} authorUsername - The unique username of the post's author.
 * @property {string} authorAvatarUrl - The URL for the author's profile avatar.
 * @property {string} content - The text content of the post.
 * @property {string} createdAt - The creation timestamp, potentially formatted for display.
 * @property {number} replyCount - The total number of replies (comments) on the post.
 * @property {number} likeCount - The total number of likes on the post.
 * @property {boolean} isLiked - Indicates if the current user has liked the post.
 * @property {string[]} [commentPreviewIds] - An optional array of comment IDs for displaying previews in a feed.
 * @property {ApiComment[]} [commentPreview] - An optional array holding raw comment preview data from the API before it is processed and normalized.
 */
export interface PostData {
    id: string;
    authorName: string;
    authorUsername: string;
    authorAvatarUrl: string;
    content: string;
    createdAt: string;
    replyCount: number;
    likeCount: number;
    isLiked: boolean;
    commentPreviewIds?: string[];
    commentPreview?: ApiComment[];
    postType: 'REGULAR' | 'RATE_POST';
    hashtags?: string[];
}


/**
 * @interface PostProps
 * @description  Represents the properties for a post component.
 * @property {PostData} post - An object containing all relevant data for a post
 * @property {boolean} isDetailedView - Indicates whether the post should be displayed in a detailed view (With full Timestamp).
     * Defaults to `false` if not provided
 * @property {boolean} isGateway - Indicates whether the post is part of a gateway context. (It can lead to another page).
     * Defaults to `false` if not provided.
 * @property {Callback Function} onReplyClick - Callback function to trigger action on the Post Detail Page such as focusing the text area 
 */
export interface PostProps{
    post: PostData;
    isDetailedView?: boolean;
    isGateway?: boolean;
    onReplyClick?: () => void;
}
