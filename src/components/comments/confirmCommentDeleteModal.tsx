// src/components/modals/ConfirmDeleteModal.tsx
import { useState, type JSX } from 'react';
import { useAppDispatch } from '../../utils/hooks';
import { deleteComment } from '../../thunks/commentsThunks/deleteCommentThunk';
import type { CommentData } from '../../types/commentType';
import { setError } from '../../slices/ui/uiSlice';
import Modal from '../common/modal';
import '../posts/confirmPostDeleteModal.css';

interface ConfirmCommentDeleteModalProps {
    comment: CommentData;
    postId: string;
    isOpen: boolean;
    onClose: () => void;
}

const ConfirmCommentDeleteModal = ({ comment, postId, isOpen, onClose }: ConfirmCommentDeleteModalProps): JSX.Element => {
    const dispatch = useAppDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            await dispatch(deleteComment({commentId: comment.id, postId: postId})).unwrap();
            onClose(); // Close on successful delete
        } catch (err: any) {
            dispatch(setError(err.message || 'Failed to delete post.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleCloseModal} title='Delete Comment?'> 
            <p>This can’t be undone and it will be removed permanently.</p>
            <div className="confirm-delete-modal-actions">
                <button className="btn-secondary" onClick={handleCloseModal} disabled={isSubmitting}>
                    Cancel
                </button>
                <button className="button-danger" onClick={handleDelete} disabled={isSubmitting}>
                    {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </Modal>
    );
};

export default ConfirmCommentDeleteModal