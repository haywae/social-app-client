import type { CommentData } from "../types/commentType";

/**
 * Takes a nested array of API comments, transforms them to the client-side format,
 * and returns a single, flat array of CommentData.
 * This is the primary utility for processing API responses before they hit the reducer,
 * ensuring the data is perfectly structured for our normalized state.
 */
export const flattenComments = (apiComments: CommentData[]): CommentData[] => {
    let allComments: CommentData[] = [];
    
    for (const apiComment of apiComments) {
        // Destructure to separate the replies from the comment itself for processing
        const { replies, ...commentData } = apiComment;
        
        allComments.push(commentData);
        
        // If there are nested replies in the API response, recursively flatten them
        if (replies && replies.length > 0) {
            allComments = allComments.concat(flattenComments(replies));
        }
    }
    
    return allComments;
};