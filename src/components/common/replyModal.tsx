import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { createComment } from '../../thunks/commentsThunks/createCommentThunk';
import { setError } from '../../slices/ui/uiSlice';
import { type PostData } from '../../types/postType';
import { type CommentData } from '../../types/commentType';
import Modal from './modal';
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

    // Clear content when the modal is closed to prevent stale text
    useEffect(() => {
        if (!isOpen) {
            setContent('');
        }
    }, [isOpen]);

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
                tags: []
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
            <div className="modal-footer">
                <button onClick={handleSubmit} className="btn-primary" disabled={!content.trim() || isSubmitting}>
                    {isSubmitting ? 'Replying...' : 'Reply'}
                </button>
            </div>
        </Modal>
    );
};

export default ReplyModal;