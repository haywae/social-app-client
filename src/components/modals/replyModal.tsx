import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { createComment } from '../../thunks/commentsThunks/createCommentThunk';
import { setError } from '../../slices/ui/uiSlice';
import { type PostData } from '../../types/postType';
import { type CommentData } from '../../types/commentType';
import { EmojiIcon } from '../../assets/icons';
import EmojiPicker, {type EmojiClickData, Theme } from "emoji-picker-react";
import Modal from '../modals/modal';
import './replyModal.css';

interface ReplyModalProps {
    target: PostData | CommentData; // Target can be a Post or a Comment
    postId: string;
    onClose: () => void;
    isOpen: boolean;
}

// A simple type guard to check if the target is a Comment
const isComment = (target: PostData | CommentData): target is CommentData => {
    return 'parentId' in target;
};

const ReplyModal = ({ target, postId, onClose, isOpen }: ReplyModalProps) => {
    const dispatch = useAppDispatch();
    const loggedInUser = useAppSelector((state) => state.auth.user);
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPicker, setShowPicker] = useState(false)

    // Detects user's system theme
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;


    // --- Refs for detecting outside clicks ---
    const pickerRef = useRef<HTMLDivElement>(null);
    const emojiButtonRef = useRef<HTMLButtonElement>(null);

    // Clear content when the modal is closed to prevent stale text
    useEffect(() => {
        if (!isOpen) {
            setContent('');
        }
    }, [isOpen]);

        // --- useEffect to handle clicks outside the picker ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                pickerRef.current && !pickerRef.current.contains(event.target as Node) &&
                emojiButtonRef.current && !emojiButtonRef.current.contains(event.target as Node)
            ) {
                setShowPicker(false);
            }
        };
        if (showPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showPicker]);

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setContent(prevContent => prevContent + emojiData.emoji);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true)
        try{
            await dispatch(createComment({
                postId,
                content,
                // If the target is a comment, use its ID as parent_id. Otherwise, it's null.
                parent_id: isComment(target) ? target.id : null,
            })).unwrap();

            onClose();
        } catch(error: any) {
            dispatch(setError(error))
        } finally {
            setIsSubmitting(false)
        }
    };

    // Conditionally set the header and content based on the target type
    const authorUsername = target.authorUsername;
    const originalContent = target.content;

    let headerText = `Replying to @${authorUsername}`;
    if (authorUsername === loggedInUser?.username) {
        headerText = isComment(target) ? "Add a reply to your comment" : "Add a comment to your post";
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={headerText}>
                <p className="original-comment-content">{originalContent}</p>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Post your reply"
                    autoFocus
                    disabled={isSubmitting}
                />
            <div className="reply-modal-footer">
                <div className="post-actions">
                    <button ref={emojiButtonRef} className="icon-action-button" onClick={() => setShowPicker(val => !val)}>
                        <EmojiIcon />
                    </button>
                    {showPicker && (
                        <div ref={pickerRef} className="emoji-picker-wrapper">
                            <EmojiPicker onEmojiClick={handleEmojiClick} height={350} width={300}                                     skinTonesDisabled
                                previewConfig={{ showPreview: false }} theme={isDarkMode ? Theme.DARK : Theme.LIGHT }
                            />
                        </div>
                    )}
                </div>
                <button onClick={handleSubmit} className="btn-primary" disabled={!content.trim() || isSubmitting}>
                    {isSubmitting ? 'Replying...' : 'Reply'}
                </button>
            </div>
        </Modal>
    );
};

export default ReplyModal;