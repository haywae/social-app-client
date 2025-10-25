// src/components/modals/EditPostModal.tsx
// Uses the same Structure and Stylesheet as the edit post Modal
import { useState, type JSX, useEffect } from 'react';
import { useAppDispatch } from '../../utils/hooks';
import { updateComment } from '../../thunks/commentsThunks/updateCommentThunk';
import type { CommentData } from '../../types/commentType';
import { setError } from '../../slices/ui/uiSlice';
import Modal from '../modals/modal';
import './editPostModal.css'; 

interface EditCommentModalProps {
    comment: CommentData;
    isOpen: boolean;
    onClose: () => void;
}

const EditCommentModal = ({ comment, isOpen, onClose }: EditCommentModalProps): JSX.Element => {
    const dispatch = useAppDispatch();
    const [editedContent, setEditedContent] = useState(comment.content);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset editedContent when the modal opens or post changes
    useEffect(() => {
        if (isOpen) {
            setEditedContent(comment.content);
        }
    }, [isOpen]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const newContent = editedContent.trim();

        // 1. Check if the content is empty.
        if (!newContent) {
            dispatch(setError("Comment cannot be empty."));
            return;
        }

        // 2. Check if content has actually changed.
        if (newContent === comment.content.trim()) {
            onClose(); // Close if no changes
            return;
        }

        setIsSubmitting(true);

        try {
            await dispatch(updateComment({ commentId: comment.id, content: editedContent })).unwrap();
            onClose(); // Close on successful update
        } catch (err: any) {
            dispatch(setError(err.message || 'Failed to update post.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        // Only allow closing if not submitting
        if (!isSubmitting) {
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleCloseModal} title='Edit Comment'>
            <div className="modal-container edit-post-modal">
                <form onSubmit={handleUpdate} className="edit-post-form">
                    <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={6} disabled={isSubmitting}
                    />
                    <div className="edit-post-modal-footer">
                        <button type="button" className="edit-post-btn-secondary" onClick={handleCloseModal} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button type="submit" className="edit-post-btn-primary" disabled={isSubmitting || editedContent.trim() === comment.content.trim()}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default EditCommentModal;