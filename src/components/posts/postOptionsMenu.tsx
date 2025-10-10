// src/components/Post/postOptionsMenu.tsx
import { useEffect, useRef, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PostData } from '../../types/postType';
import { EditIcon, TrashIcon, LinkIcon, ProfileIcon, ViewIcon } from '../../assets/icons'; 
import './postOptionsMenu.css';

interface PostOptionsMenuProps {
    postUrl: string;
    post: PostData;
    isAuthor: boolean;
    isDetailedView: boolean;
    onClose: () => void;
    onEditClick: () => void;      // Prop to handle edit click
    onDeleteClick: () => void;    // Prop to handle delete click
}

const PostOptionsMenu = ({ postUrl, post, isAuthor, isDetailedView, onClose, onEditClick, onDeleteClick }: PostOptionsMenuProps): JSX.Element => {
    const menuRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();


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
        await navigator.clipboard.writeText(postUrl);
        onClose(); // Close the menu after copying
    };

    const handleVisitProfile = () => {
        navigate(`/profile/${post.authorUsername}`);
        onClose();
    };

    const handleViewPost = () => {
        navigate(`/post/${post.id}`);
        onClose();
    };
    // 1. Define one hour in milliseconds for clarity.
    const ONE_HOUR_IN_MS = 60 * 60 * 1000;

    // 2. Calculate the comment's age by subtracting its creation time from the current time.
    const postAgeInMs = Date.now() - new Date(post.createdAt).getTime();

    // 3. The comment is editable if it's less than one hour old.
    const postIsEditable = postAgeInMs < ONE_HOUR_IN_MS;
    return (
        <div className="options-popover-container" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <ul className="menu-option-list">
                {isAuthor ? (
                    <>
                        <li className="menu-option-item menu-option-danger" onClick={onDeleteClick}>
                            <TrashIcon />
                            <span>Delete Post</span>
                        </li>
                        {postIsEditable && <li className="menu-option-item" onClick={onEditClick}>
                            <EditIcon />
                            <span>Edit Post</span>
                        </li>}
                    </>
                ) : (
                    <>
                        <li className="menu-option-item" onClick={handleVisitProfile}>
                            <ProfileIcon />
                            <span>Visit @{post.authorUsername}'s profile</span>
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
                    <span>Copy link to post</span>
                </li>
            </ul>
        </div>
    );
};

export default PostOptionsMenu;