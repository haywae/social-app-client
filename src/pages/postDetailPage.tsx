import { useEffect, type JSX } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector, useTitle } from '../utils/hooks';
import { fetchSinglePost } from '../thunks/postsThunks/fetchSinglePostThunk';

import { clearPosts } from '../slices/posts/postsSlice';
import Post from '../components/posts/post';
import { LeftArrowIcon } from '../assets/icons';
import '../styles/postDetailPage.css';

const PostDetailPage = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { postId } = useParams<{ postId: string }>();

    // --- Redux State Selection ---
    const { posts, loading: postLoading, error: postError } = useAppSelector((state) => state.posts);
    const post = posts[0]; // The single post is always the first item in the array.

    /**
     * Effect to fetch the post
     * or when the postId from the URL changes. It also includes a cleanup
     */
    useEffect(() => {
        if (postId) {
            dispatch(fetchSinglePost(postId));
        }

        // Cleanup function to clear post data preventing stale data
        // from showing when navigating to a different post detail page.
        return () => {
            dispatch(clearPosts());
        };
    }, [postId, dispatch]);

    useTitle(`Post - WolexChange`);


    const handleNavigate = () => {
        // Check if the user was navigated to this page from within the app
        if (location.key !== 'default') {
            // If there's a history stack, go back one step
            navigate(-1);
        } else {
            navigate('/'); // The public homepage
        }
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
                    <button onClick={handleNavigate} className="back-button"><LeftArrowIcon /></button>
                    <h2>Post not found</h2>
                </header>
                <div className="detail-message">
                    <p>This post may have been deleted by the author or the link is incorrect.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="detail-page-container">
            {/* --- Sticky Header --- */}
            <header className="detail-header">
                <button onClick={() => navigate(-1)} className="back-button">{<LeftArrowIcon />}</button>
                <h2>Post</h2>
            </header>
            {/* --- Main Post Content --- */}

            {/* Scrollable Content */}
            <div className="detail-scroll-area">
                <Post post={post} isDetailedView={true} />
            </div>
        </div>

    );
};

export default PostDetailPage;