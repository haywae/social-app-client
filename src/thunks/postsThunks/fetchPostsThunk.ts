import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../apiInterceptor";
import { type FetchedPostsPayload, type PostData } from "../../types/postType";
import { transformAndFlattenComments } from '../../utils/commentUtils'; // We can use this here too
import { type ApiComment } from "../../types/commentType";

interface FetchPostsArgs {
    page: number;
    perPage: number;
}

export const fetchPosts = createAsyncThunk<
    FetchedPostsPayload,
    FetchPostsArgs,
    { rejectValue: string }
>(
    'posts/fetchPosts',
    async ({ page, perPage }, { rejectWithValue }) => {
        try {
            
            const response = await api(`/feeds?page=${page}&per_page=${perPage}`, {
                method: 'GET',
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to fetch posts.');
            }

            const data = await response.json();
            const postsFromApi: PostData[] = data.posts;

            const allCommentPreviews: ApiComment[] = postsFromApi.flatMap(post => post.commentPreview || []);
            const comments = transformAndFlattenComments(allCommentPreviews);

            return {
                posts: postsFromApi,
                comments: comments,
                currentPage: data.currentPage,
                totalPages: data.totalPages,
            };

        } catch (error: any) {
            return rejectWithValue(error.message || 'An unexpected network error occurred.');
        }
    }
);