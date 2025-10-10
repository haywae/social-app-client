import { useRef, useEffect, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditIcon, TrashIcon, LinkIcon, ProfileIcon, ViewIcon } from '../../assets/icons'; 
import type { CommentData } from '../../types/commentType';
import '../posts/postOptionsMenu.css'; // Reuse the same as post options CSS

interface CommentOptionsMenuProps {
    onClose: () => void;
    onEditClick: () => void;     
    onDeleteClick: () => void;  
    commentUrl: string; 
    comment: CommentData;
    isAuthor: boolean;
    isDetailedView: boolean;
    postId: string;
}

const CommentOptionsMenu = ({ onClose, onEditClick, onDeleteClick, 
    commentUrl, comment, isAuthor, isDetailedView, postId}: CommentOptionsMenuProps
): JSX.Element => {
    const menuRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate()

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                    onClose();
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, [onClose]);

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(commentUrl);
        onClose(); // Close the menu after copying
    };

    const handleVisitProfile = () => {
        navigate(`/profile/${comment.authorUsername}`);
        onClose();
    };

    const handleViewPost = () => {
        navigate(`/post/${postId}`);
        onClose();
    };
    // 1. Define one hour in milliseconds for clarity.
    const ONE_HOUR_IN_MS = 60 * 60 * 1000;

    // 2. Calculate the comment's age by subtracting its creation time from the current time.
    const commentAgeInMs = Date.now() - new Date(comment.createdAt).getTime();

    // 3. The comment is editable if it's less than one hour old.
    const commentIsEditable = commentAgeInMs < ONE_HOUR_IN_MS;

        return (
        <div className="options-popover-container" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <ul className="menu-option-list">
                {isAuthor ? (
                    <>
                        <li className="menu-option-item menu-option-danger" onClick={onDeleteClick}>
                            <TrashIcon />
                            <span>Delete Comment</span>
                        </li>
                        {commentIsEditable && <li className="menu-option-item" onClick={onEditClick}>
                            <EditIcon />
                            <span>Edit Comment</span>
                        </li>}
                    </>
                ) : (
                    <>
                        <li className="menu-option-item" onClick={handleVisitProfile}>
                            <ProfileIcon />
                            <span>Visit @{comment.authorUsername}'s profile</span>
                        </li>
                    </>
                )}

                {/* These options are available for everyone */}
                {!isDetailedView &&<li className="menu-option-item" onClick={handleViewPost}>
                    <ViewIcon />
                    <span>View Post</span>
                </li>}
                <li className="menu-option-item" onClick={handleCopyLink}>
                    <LinkIcon />
                    <span>Copy link to comment</span>
                </li>
            </ul>
        </div>
    );
};

export default CommentOptionsMenu;