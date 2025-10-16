import { useEffect, type JSX } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../utils/hooks';

import { fetchSinglePost } from '../thunks/postsThunks/fetchSinglePostThunk';
import { fetchSingleComment } from '../thunks/commentsThunks/fetchSingleCommentThunk';
import { fetchUserExchangeData } from '../thunks/exchangeThunks/fetchUserExchangeDataThunk';

import { clearPosts } from '../slices/posts/postsSlice';
import { clearComments } from '../slices/comments/commentsSlice';
import { clearExchangeData } from '../slices/exchange/exchangeSlice';

import Post from '../components/posts/post';
import Comment from '../components/comments/comment';
import LiveRatesTab from '../components/userProfile/liveRatesTab';
import { LeftArrowIcon } from '../assets/icons';
import '../styles/postDetailPage.css'; // Uses the same css as the post detail page

const ViewPage = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Get the IDs/usernames from the URL query parameters
    const postId = searchParams.get('post');
    const commentId = searchParams.get('comment');
    const exchangeUser = searchParams.get('exchange');

    // Select data from all relevant slices
    const { posts, loading: postLoading } = useAppSelector((state) => state.posts);
    const { commentsById, loading: commentLoading } = useAppSelector((state) => state.comments);
    const { exchangeData, loading: exchangeLoading } = useAppSelector((state) => state.profile);
    const { user: loggedInUser } = useAppSelector((state) => state.auth);


    useEffect(() => {
        // Dispatch the correct thunk based on the URL parameters
        if (commentId) {
            dispatch(fetchSingleComment({ commentId }));
        } else if (postId) {
            dispatch(fetchSinglePost(postId));
        } else if (exchangeUser) {
            dispatch(fetchUserExchangeData(exchangeUser));
        }

        // Cleanup function to clear state when leaving the page
        return () => {
            dispatch(clearPosts());
            dispatch(clearComments());
            dispatch(clearExchangeData());
        };
    }, [postId, commentId, exchangeUser, dispatch]);

    // --- Render Logic ---
    const isLoading = postLoading === 'pending' || commentLoading === 'pending' || exchangeLoading === 'pending';

    const renderContent = () => {
        if (isLoading) {
            return <div className="detail-message">Loading...</div>;
        }
        if (posts.length > 0) {
            return <Post post={posts[0]} isDetailedView={true} isGateway={true} />;
        }
        if (commentId && commentsById[commentId]) {
            return <Comment commentId={commentId} postId={commentsById[commentId].postId} isDetailedView={true} isGateway={true} />;
        }
        if (exchangeData) {
            return <LiveRatesTab exchangeData={exchangeData} />;
        }
    };

    return (
        <>
            <title>{'View - WolexChange'}</title>
            <div className="detail-page-container">
                {loggedInUser && <header className="detail-header">
                    <button onClick={() => navigate(-1)} className="back-button"><LeftArrowIcon /></button>
                    <h2>View</h2>
                </header>}
                <div className="detail-scroll-area">
                    {renderContent()}
                </div>
            </div>
        </>
    );
};

export default ViewPage; // This page does not need withAuth