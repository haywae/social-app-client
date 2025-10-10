import { type CommentData, type ApiComment } from "../types/commentType";


/**
 * Transforms a single raw API comment object (without its replies) into the 
 * client-side CommentData format. This is the single source of truth for mapping
 * backend data to the frontend model.
 */
export const transformApiComment = (apiComment: Omit<ApiComment, 'replies'>): CommentData => {
    const transformedData = {
        id: apiComment.id,
        authorName: apiComment.user.displayName,
        authorUsername: apiComment.user.username,
        authorAvatarUrl: apiComment.user.profile_picture_url,
        content: apiComment.content,
        createdAt: apiComment.created_at,
        likeCount: apiComment.like_count,
        replyCount: apiComment.reply_count,
        isLiked: apiComment.is_liked || false,
        parentId: apiComment.parent_id,
        postId: apiComment.post_id
    };
    return transformedData;
};


/**
 * Takes a nested array of API comments, transforms them to the client-side format,
 * and returns a single, flat array of CommentData.
 * This is the primary utility for processing API responses before they hit the reducer,
 * ensuring the data is perfectly structured for our normalized state.
 */
export const transformAndFlattenComments = (apiComments: ApiComment[]): CommentData[] => {
    let allComments: CommentData[] = [];
    
    for (const apiComment of apiComments) {
        // Destructure to separate the replies from the comment itself for processing
        const { replies, ...commentData } = apiComment;
        
        // Add the transformed parent comment to our flat list.
        // No type cast is needed now as the types match correctly.
        allComments.push(transformApiComment(commentData));
        
        // If there are nested replies in the API response, recursively flatten them
        if (replies && replies.length > 0) {
            allComments = allComments.concat(transformAndFlattenComments(replies));
        }
    }
    
    return allComments;
};