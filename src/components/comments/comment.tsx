import { useState, type JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EllipseIcon, HeartIcon, LinkIcon } from "../../assets/icons";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import { toggleCommentLike } from "../../thunks/commentsThunks/toggleCommentLikeThunk"
import CommentOptionsMenu from "./commentOptionsMenu";
import { DEFAULT_AVATAR_URL, IMAGE_BASE_URL } from "../../appConfig";
import { formatDetailedTimestamp, formatRelativeTimestamp } from "../../utils/timeformatUtils";
import { openModal } from "../../slices/ui/uiSlice";
import "../posts/post.css";
import "./comment.css"

interface CommentProps {
    commentId: string;
    postId: string;
    isDetailedView?: boolean;
    isGateway?: boolean;
}

const Comment = ({ commentId, postId, isDetailedView = false, isGateway = false }: CommentProps): JSX.Element => {
    const dispatch = useAppDispatch();

    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // --- SELECT DATA FROM THE NORMALIZED STATE ---
    const comment = useAppSelector((state) => state.comments.commentsById[commentId]);
    const loggedInUsername = useAppSelector((state) => state.auth.user?.username ?? null);
    const isAuthor = comment.authorUsername === loggedInUsername;

    const [copied, setCopied] = useState(false);

    // Construct a URL that will lead to the view page
    const commentUrl = `${window.location.origin}/view?comment=${comment.id}`;

    // --- Handlers for Modals ---

    const handleOpenEditModal = () => {
        setIsMenuOpen(false); // Close the popover
        dispatch(openModal({
            modalType: 'EDIT_COMMENT',
            modalProps: { comment }
        }))
    };

    const handleOpenDeleteModal = () => {
        setIsMenuOpen(false); // Close the popover
        dispatch(openModal({
            modalType: 'CONFIRM_DELETE_COMMENT',
            modalProps: { comment: comment, postId: postId }
        }))
    };

    // Navigate users to the post detail page when the 
    const handleNavigateToPost = () => {
        // Only navigate when user is not on a detailed page or the page is a gateway
        if (isGateway && postId) {
            navigate(`/post/${postId}?fc=${commentId}`);
        }
    };

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(toggleCommentLike({ commentId: comment.id, isLiked: comment.isLiked }));
    };

    const handleShareClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            await navigator.clipboard.writeText(commentUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Show "Copied!" for 2 seconds
        } catch (err) {
            console.error("Failed to copy link: ", err);
        }
    };

    if (!comment) {
        return <div></div>;
    }

    return (
        <>
            <article className="post-container comment-container" onClick={handleNavigateToPost}>
                {/* ... header, content, and footer of the comment ... */}
                <header className="post-header">
                    <div className="post-avatar-container">
                        <Link to={`/profile/${comment.authorUsername}`}>
                            <img
                                src={comment.authorAvatarUrl ? `${IMAGE_BASE_URL}/${comment.authorAvatarUrl}` : DEFAULT_AVATAR_URL}
                                alt={`${comment.authorName}'s avatar`}
                                className="user-avatar avatar-sm"
                            />
                        </Link>
                    </div>
                    <div className="post-author-meta">
                        <Link to={`/profile/${comment.authorUsername}`} className="author-name-link" >
                            <span className="author-display-name">{comment.authorName}</span>
                        </Link>
                        <div className="author-meta-line">
                            <span className="author-username">@{comment.authorUsername}</span>
                            {/* {Only show the short timestamp on a detailed view that does not exists has a gateway (Avoids showing it on the view page)} */}
                            {isDetailedView && !isGateway && <span className="post-timestamp">{formatRelativeTimestamp(comment.createdAt)}</span>}
                        </div>
                    </div>
                    <div className="post-header-actions options-menu-container">
                        <button className="icon-action-button" onClick={() => { setIsMenuOpen(true) }}>
                            <EllipseIcon />
                        </button>
                        {isMenuOpen && postId && (
                            <CommentOptionsMenu
                                comment={comment}
                                postId={postId}
                                isAuthor={isAuthor}
                                isDetailedView={isDetailedView}
                                commentUrl={commentUrl}
                                onClose={() => setIsMenuOpen(false)}
                                onDeleteClick={handleOpenDeleteModal}
                                onEditClick={handleOpenEditModal}
                            />
                        )}
                    </div>
                </header>

                <div className="post-content">
                    <p>{comment.content}</p>
                </div>
                {/* If isDetailedView is set to True from the caller, the full timestamp will be displayed */}
                {isDetailedView && (
                    <div className="post-detailed-info">
                        <time dateTime={comment.createdAt}>
                            {isDetailedView && isGateway && formatDetailedTimestamp(comment.createdAt)}
                        </time>
                    </div>
                )}

                <footer className="post-actions">
                    <button className={`icon-action-button action-like ${comment.isLiked ? 'liked' : ''}`} onClick={handleLike}>
                        <HeartIcon filled={comment.isLiked} />
                        <span>{comment.likeCount}</span>
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
    )
};

export default Comment;