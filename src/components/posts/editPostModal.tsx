// src/components/modals/EditPostModal.tsx
import { useState, type JSX, useEffect } from 'react';
import { useAppDispatch } from '../../utils/hooks';
import { parseTags } from '../../utils/tagsUtils';
import { updatePost } from '../../thunks/postsThunks/updatePostThunk';
import type { PostData as Post } from '../../types/postType';
import Modal from '../common/modal';
import { setError } from '../../slices/ui/uiSlice';
import './editPostModal.css'; 

interface EditPostModalProps {
    post: Post;
    isOpen: boolean;
    onClose: () => void;
}

const EditPostModal = ({ post, isOpen, onClose }: EditPostModalProps): JSX.Element => {
    const dispatch = useAppDispatch();
    const [editedContent, setEditedContent] = useState(post.content);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset editedContent when the modal opens or post changes
    useEffect(() => {
        if (isOpen) {
            setEditedContent(post.content);
        }
    }, [isOpen, post.content]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        // Only update if content has actually changed
        if (editedContent.trim() === post.content.trim()) {
            onClose(); // Close if no changes
            return;
        }

        setIsSubmitting(true);
        const tags = parseTags(editedContent);

        try {
            await dispatch(updatePost({ postId: post.id, content: editedContent, tags })).unwrap();
            onClose(); // Close on successful update
        } catch (err: any) {
            dispatch(setError(err || 'Failed to update post.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        // Only allow closing if not submitting
        if (!isSubmitting) onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleCloseModal} title='Edit Post'>
            <form onSubmit={handleUpdate} className="edit-post-form">
                <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={6}
                    disabled={isSubmitting}
                />
                <div className="edit-post-modal-footer">
                    <button type="button" className="edit-post-btn-secondary" onClick={handleCloseModal} disabled={isSubmitting}>
                        Cancel
                    </button>
                    <button type="submit" className="edit-post-btn-primary" disabled={isSubmitting || editedContent.trim() === post.content.trim()}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditPostModal;