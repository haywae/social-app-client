import { useEffect, useRef, useCallback, type JSX } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { fetchPosts } from '../../thunks/postsThunks/fetchPostsThunk';
import { fetchUserPosts } from '../../thunks/postsThunks/fetchUserPostsThunk';
import Post from './post';
import './postFeed.css';
import { clearPosts } from '../../slices/posts/postsSlice';

// The component now accepts an optional `username` prop
interface PostFeedProps {
    username?: string;
}

/**
 * A component that displays a feed of posts for the home page and User Profile Page.
 * If a `username` prop is provided, it renders them directly.
 * Otherwise, it fetches the main feed with infinite scroll.
 */
const PostFeed = ({ username }: PostFeedProps): JSX.Element => {

    const dispatch = useAppDispatch();
    const { posts, loading, error, currentPage, totalPages } = useAppSelector((state) => state.posts);

    // The observer ref will be attached to the last element in the list
    const observer = useRef<IntersectionObserver | null>(null); 

    // useCallback ensures this function isn't recreated on every render,
    // which is important for the IntersectionObserver.
    const lastPostElementRef = useCallback((node: HTMLDivElement) => {
        // If there's no node or we're not self-managing posts, do nothing.
        if (loading === 'pending') return;
        // Disconnect the old observer if it exists.
        if (observer.current) observer.current.disconnect();
        // Create a new observer.
        observer.current = new IntersectionObserver(entries => {
            // If the last element is visible and there are more pages to load...
        
            if (entries[0].isIntersecting && currentPage < totalPages) {
                // ...dispatch the action to fetch the next page.
                const nextPage = currentPage + 1;
                if (username) {
                    dispatch(fetchUserPosts({ username, page: nextPage, perPage: 10 }));
                } else {
                    dispatch(fetchPosts({ page: nextPage, perPage: 10 }));
                }
            }
        });
        // If a node is passed to the ref, start observing it.
        if (node) observer.current.observe(node);
    }, [loading, dispatch, currentPage, totalPages, username]);

    // Effect for the initial data fetch when the component mounts.
    useEffect(() => {
        dispatch(clearPosts()); // Clear previous posts if any
        // If a username is provided, fetch user posts;
        if (username) {
            dispatch(fetchUserPosts({ username, page: 1, perPage: 10 }));
        } else {
            // Otherwise, fetches the main feed.
            dispatch(fetchPosts({ page: 1, perPage: 10 }));
        }

        return () => {
            dispatch(clearPosts()); // Clear posts when the component unmounts
        }
    }, [dispatch, username]);

    if (loading === 'pending' && posts.length === 0) {
        return <div className="feed-loading"><div></div><div></div><div></div></div>; // Show spinner on initial load
    }

    if (loading === 'succeeded' && posts.length === 0) {
        return <div className="feed-message">No posts found.</div>;
    }
    
    return (
        <div className="post-feed-container">
            {posts.map((post, index) => {
                // If this is the last post in the array, attach the ref to it.
                if (posts.length === index + 1) {
                    return (
                        <div ref={lastPostElementRef} key={post.id}>
                            <Post post={post} />
                        </div>
                    );
                } else {
                    return <Post key={post.id} post={post} isGateway={true}/>;
                }
            })}

            {/* Show spinner only when loading subsequent pages */}
            {loading === 'pending' && posts.length > 0 && (
                <div className="feed-loading"><div></div><div></div><div></div></div>
            )}

            {error && <div className="feed-message">Posts could not be loaded.</div>}
        </div>
    );
};

export default PostFeed;
