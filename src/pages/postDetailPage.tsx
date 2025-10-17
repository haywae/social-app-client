/**
 * -----------------------------------------------------------------------------
 * PostDetailPage.tsx
 * -----------------------------------------------------------------------------
 * This component renders the detailed view of a single post, including its
 * content, associated comments, and a form for creating new comments.
 * -----------------------------------------------------------------------------
 */

import { useEffect, type JSX, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../utils/hooks';
import { fetchSinglePost } from '../thunks/postsThunks/fetchSinglePostThunk';
import { fetchComments } from '../thunks/commentsThunks/fetchCommentsThunk';
import { createComment } from '../thunks/commentsThunks/createCommentThunk';
import { clearPosts } from '../slices/posts/postsSlice';
import { clearComments } from '../slices/comments/commentsSlice';
import Post from '../components/posts/post';
import Comment from '../components/comments/comment';
import withAuth from '../components/common/withAuth';
import { LeftArrowIcon } from '../assets/icons';
import '../styles/postDetailPage.css';

const PostDetailPage = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { postId } = useParams<{ postId: string }>();
    const [searchParams] = useSearchParams();
    const focusedCommentId = searchParams.get('fc');

    // --- Redux State Selection ---
    const { posts, loading: postLoading, error: postError } = useAppSelector((state) => state.posts);
    const post = posts[0]; // The single post is always the first item in the array.

    // Select topLevelCommentIds directly from the normalized slice
    const {
        topLevelCommentIds,
        loading: commentsLoading,
        error: commentsError,
        currentPage,
        totalPages
    } = useAppSelector((state) => state.comments);

    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // ---  Local State ---
    const [commentContent, setCommentContent] = useState('');
    /**
     * Effect to fetch the post and its initial comments when the component mounts
     * or when the postId from the URL changes. It also includes a cleanup
     */
    useEffect(() => {
        if (postId) {
            dispatch(fetchSinglePost(postId));
            dispatch(fetchComments({ postId, page: 1, focusedCommentId }));
        }

        // Cleanup function to clear post and comment data, preventing stale data
        // from showing when navigating to a different post detail page.
        return () => {
            dispatch(clearPosts());
            dispatch(clearComments());
        };
    }, [postId, dispatch]);

    /**
     * Handles the submission of a new comment or reply.
     * It parses tags, dispatches the createComment thunk, and clears the form on success.
     */
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim() || !postId) return;

        const result = await dispatch(createComment({
            postId,
            content: commentContent,
            parent_id: null, // Will be null if it's not a reply
        }));

        // If the comment was created successfully, clear the input and reply state.
        if (createComment.fulfilled.match(result)) {
            setCommentContent('');
        }
    };

    // --- Fetches the next page of comments when the "Load More" button is clicked. ---
    const handleLoadMoreComments = () => {
        if (postId && currentPage < totalPages) {
            dispatch(fetchComments({ postId, page: currentPage + 1 }));
        }
    };

    const focusReplyInput = () => {
        textAreaRef.current?.focus();
    };

    // --- Render Logic ---

    // Loading state for the main post.
    if (postLoading === 'pending' || postLoading === 'idle') {
        return <div className="detail-message">Loading post...</div>;
    }

    // Error state if the post fails to load or doesn't exist.
    if (postError || !post) {
        return (
            <div className="detail-page-container">
                <header className="detail-header">
                    <button onClick={() => navigate(-1)} className="back-button"><LeftArrowIcon /></button>
                    <h2>Post not found</h2>
                </header>
                <div className="detail-message">
                    <p>This post may have been deleted by the author or the link is incorrect.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <title>Post - WolexChange</title>
            <div className="detail-page-container">
                {/* --- Sticky Header --- */}
                <header className="detail-header">
                    <button onClick={() => navigate(-1)} className="back-button">{<LeftArrowIcon />}</button>
                    <h2>Post</h2>
                </header>
                {/* --- Main Post Content --- */}

                {/* Scrollable Content */}
                <div className="detail-scroll-area">
                    <Post post={post} isDetailedView={true} onReplyClick={focusReplyInput} />
                    {/* --- Comments List --- */}
                    <div className="comments-list">
                        <h3 className="comments-header">Comments</h3>

                        {/* Map over topLevelCommentIds and pass the ID to the Comment component */}
                        {topLevelCommentIds.map((commentId) => (
                            postId && <Comment key={commentId} commentId={commentId} postId={postId} isDetailedView={true} />
                        ))}

                        {/* --- "Load More" button and loading indicator --- */}
                        {currentPage < totalPages && (
                            <div className="load-more-container">
                                <button
                                    onClick={handleLoadMoreComments}
                                    disabled={commentsLoading === 'pending'}
                                    className="load-more-button"
                                >
                                    {commentsLoading === 'pending' ? 'Loading...' : 'Load more comments'}
                                </button>
                            </div>
                        )}
                        {commentsError && <div className="detail-message error">{commentsError}</div>}
                    </div>
                </div>

                {/* --- Sticky Comment Creation Form --- */}
                <div className="create-comment-section">
                    <div className="comment-input-area">
                        <textarea
                            ref={textAreaRef}
                            className="comment-textarea"
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="Post your reply"
                            rows={1}
                        />
                        <button onClick={handleCommentSubmit} className="btn-primary comment-submit-btn" disabled={!commentContent.trim()}>Reply</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default withAuth(PostDetailPage);