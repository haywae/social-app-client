import { useEffect, useState } from "react";


// --- Custom Debounce Hook ---
export const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};


import { type PostSearchResult } from '../slices/search/searchSlice';
import { type PostData } from "../types/postType";

/**
 * Transforms a post from a search result into the standard PostData format.
 * @param searchResultPost The post object from the search API.
 * @returns A formatted PostData object ready for the <Post /> component.
 */
export const transformPostSearchResult = (searchResultPost: PostSearchResult): PostData => {
    return {
        id: searchResultPost.publicId,
        authorName: searchResultPost.author.displayName,
        authorUsername: searchResultPost.author.username,
        authorAvatarUrl: searchResultPost.author.profilePictureUrl,
        content: searchResultPost.content,
        createdAt: searchResultPost.createdAt,
        replyCount: searchResultPost.commentCount,
        likeCount: searchResultPost.likeCount,
        isLiked: searchResultPost.isLikedByUser,
        hashtags: searchResultPost.hashtags,
        postType: searchResultPost.postType,
    };
};