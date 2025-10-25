// src/components/modals/ConfirmDeleteModal.tsx
import { useState, type JSX } from 'react';
import { useAppDispatch } from '../../utils/hooks';
import { deletePost } from '../../thunks/postsThunks/deletePostThunk';
import type { PostData as Post } from '../../types/postType';
import Modal from '../modals/modal';
import { setError } from '../../slices/ui/uiSlice';
import './confirmPostDeleteModal.css';

interface ConfirmDeleteModalProps {
    post: Post;
    isOpen: boolean;
    onClose: () => void;
}

const ConfirmPostDeleteModal = ({ post, isOpen, onClose }: ConfirmDeleteModalProps): JSX.Element => {
    const dispatch = useAppDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDelete = async () => {
        setIsSubmitting(true);

        try {
            await dispatch(deletePost(post.id)).unwrap();
            onClose(); // Close on successful delete
        } catch (err: any) {
            dispatch(setError(err.message || 'Failed to delete post.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        if (!isSubmitting) onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleCloseModal} title='Delete Post'>
            <p>This can’t be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results.</p>
            <div className="confirm-delete-modal-actions">
                <button className="btn btn-secondary btn-pill" onClick={handleCloseModal} disabled={isSubmitting}>
                    Cancel
                </button>
                <button className="button-danger" onClick={handleDelete} disabled={isSubmitting}>
                    {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </Modal>
    );
};

export default ConfirmPostDeleteModal;