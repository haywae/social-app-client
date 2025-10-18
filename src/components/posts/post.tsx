import { type JSX, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EllipseIcon, ChatIcon, HeartIcon, LinkIcon } from "../../assets/icons"; 
import "./post.css";

import type { PostProps } from "../../types/postType";

import { useAppSelector, useAppDispatch } from "../../utils/hooks";

import { toggleLike } from "../../thunks/postsThunks/toggleLikeThunk";
import { DEFAULT_AVATAR_URL } from "../../appConfig";

import PostOptionsMenu from "./postOptionsMenu";
import { openModal } from "../../slices/ui/uiSlice";

import { formatRelativeTimestamp, formatDetailedTimestamp } from "../../utils/timeformatUtils";

/**
 * A component that displays a single post in a feed.
 * It includes the author's information, the post content, and action buttons.
 */

const Post = ({ post, isDetailedView = false, isGateway = false}: PostProps): JSX.Element => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const loggedInUsername = useAppSelector((state) => state.auth.user?.username ?? null);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const isAuthor = post.authorUsername === loggedInUsername;

    const postUrl = `${window.location.origin}/view?post=${post.id}`;

    // --- Handlers for Modals ---
    const handleOpenMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(true);
    };

    const handleOpenEditModal = () => {
        setIsMenuOpen(false);
        dispatch(openModal({
            modalType: 'EDIT_POST',
            modalProps: { post } // Pass the post data to the modal
        }));
    };

    const handleOpenDeleteModal = () => {
        setIsMenuOpen(false);
        dispatch(openModal({
            modalType: 'CONFIRM_DELETE_POST',
            modalProps: { post } // Pass the post data to the modal
        }));
    };

    // Handler for navigating to the post detail page
    const handleNavigateToPost = () => {
        if ((isGateway) && post?.id) {
            navigate(`/post/${post.id}`);
        }
    };

    // Handler for the like button
    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(toggleLike({ postId: post.id, isLiked: post.isLiked }));
    };

    // Handler for the reply button
    const handleReplyClick = (e: React.MouseEvent) => {
        e.stopPropagation();
       dispatch(openModal({modalType: 'REPLY', modalProps: {target: post, postId: post.id }}))
    };

    // Handler for the share/copy link button
    const handleShareClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(postUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        } catch (err) {
            console.error("Failed to copy link: ", err);
        }
    };

    const isRatePost = post.postType == 'RATE_POST'
    
    console.log(post.postType)

    return (
        <>
            <article className={`post-container ${isDetailedView ? 'detailed-view' : ''}`} onClick={handleNavigateToPost}>
                {/* --- ROW 1: HEADER --- */}
                <header className="post-header">
                    {/* Col 1: Avatar */}
                    <div className="post-avatar-container">
                        <Link to={`/profile/${post.authorUsername}`} onClick={(e) => e.stopPropagation()}>
                            <img src={post.authorAvatarUrl || DEFAULT_AVATAR_URL} alt={`${post.authorName}'s avatar`} className="user-avatar avatar-sm" />
                        </Link>
                    </div>

                    {/* Col 2: Author Meta */}
                    <div className="post-author-meta">
                        {/* Line 1: Display Name */}
                        <Link to={`/profile/${post.authorUsername}`} className="author-name-link" onClick={(e) => e.stopPropagation() }>
                            <span className="author-display-name">{post.authorName}</span>
                        </Link>

                        {/* Line 2: Username and Timestamp */}
                        <div className="author-meta-line">
                            <span className="author-username">@{post.authorUsername}</span>
                            {!isDetailedView && <span className="post-timestamp">{formatRelativeTimestamp(post.createdAt)}</span>}
                        </div>
                    </div>
                    
                    {/* Col 3: Header Actions */}
                    <div className="post-header-actions">
                        <button className="icon-action-button post-options-button" onClick={handleOpenMenu}>
                            <EllipseIcon />
                        </button>

                        {/* --- Render the menu modal conditionally --- */}
                        {isMenuOpen && (
                            <PostOptionsMenu 
                                isAuthor={isAuthor}
                                post={post}
                                isDetailedView={isDetailedView} 
                                postUrl={postUrl}
                                onClose={() => setIsMenuOpen(false)} 
                                onEditClick={handleOpenEditModal} 
                                onDeleteClick={handleOpenDeleteModal}
                            />
                        )}
                    </div>
                </header>

                {/* --- ROW 2: MAIN CONTENT --- */}
                <div className="post-content">
                    {isRatePost && <p className="rates-from">
                        <span className="rates-from-text">Fresh Rates {/*Post Author's Country*/} By </span>
                        <span className="rates-from-author">{post.authorName}</span>
                    </p>}
                    <p className={`${isRatePost ?  'rates-post-content' : ''}`}>{post.content}</p>
                    {post.hashtags && post.hashtags.length > 0 && (
                        <p className="post-hashtags">
                            {post.hashtags.map((hashtag) => (
                                <Link
                                    to={`/search?q=${hashtag}`}
                                    key={hashtag}
                                    onClick={(e) => e.stopPropagation()} // Prevent navigating to the post detail page
                                >
                                    #{hashtag} &nbsp;
                                </Link>
                            ))}
                        </p>
                    )}
                </div>

                {isDetailedView && (
                    <div className="post-detailed-info">
                        <time dateTime={post.createdAt}>
                            {formatDetailedTimestamp(post.createdAt)}
                        </time>
                    </div>
                )}

                {/* --- ROW 3: FOOTER ACTIONS --- */}
                <footer className="post-actions">
                    <button className="icon-action-button action-reply" onClick={handleReplyClick}>
                        <ChatIcon />
                        <span>{post.replyCount}</span>
                    </button>
                    <button className={`icon-action-button action-like ${post.isLiked ? 'liked' : ''}`} onClick={handleLike}>
                        <HeartIcon filled={post.isLiked? true : false}/>
                        <span>{post.likeCount}</span>
                    </button>
                    <button className="icon-action-button action-share" onClick={handleShareClick}>
                        {copied ? (
                            <span>Copied!</span>
                        ) : (
                            <LinkIcon />
                        )}
                    </button>
                </footer>
            </article>
        </>
    );
};

export default Post;
