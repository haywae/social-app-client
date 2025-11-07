// src/components/modals/EditPostModal.tsx
import { useState, type JSX, useEffect } from 'react';
import { useAppDispatch } from '../../utils/hooks';
import { extractAndCleanContent } from '../../utils/tagsUtils';
import { updatePost } from '../../thunks/postsThunks/updatePostThunk';
import type { PostData as Post } from '../../types/postType';
import Modal from '../modals/modal';
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
    const [initialContent, setInitialContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && post) {
            const tagsString = (post.hashtags || []).map(tag => `#${tag}`).join(' ');
            const combinedContent = post.content + (tagsString.length > 0 ? ` ${tagsString}` : '');

            setEditedContent(combinedContent);
            setInitialContent(combinedContent); // <-- Set initial state
        }
    }, [isOpen, post]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Add a "guard clause" at the top of the function.
        // This ensures the 'post' object is defined, which resolves the
        // "possibly 'undefined'" TypeScript error.
        if (!post) {
            dispatch(setError("Cannot update post: Post data is missing."));
            return;
        }

        const { cleanedContent, tags } = extractAndCleanContent(editedContent);

        if (!cleanedContent.trim()) {
            dispatch(setError("Post cannot be empty."));
            return;
        }

        // 2. Treat 'post.hashtags' as string[] (an array of strings)
        // This resolves the "Property 'tag_name' does not exist" error.
        const oldTags = (post.hashtags || []).sort();
        const newTags = [...new Set(tags)].sort();

        const contentChanged = cleanedContent.trim() !== post.content.trim();
        const tagsChanged = JSON.stringify(oldTags) !== JSON.stringify(newTags);

        if (!contentChanged && !tagsChanged) {
            onClose();
            return;
        }

        setIsSubmitting(true);

        try {
            await dispatch(updatePost({
                postId: post.id,
                content: cleanedContent.trim(),
                tags: newTags
            })).unwrap();

            onClose();
        } catch (err: any) {
            dispatch(setError(err.message || 'Failed to update post.'));
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
                    <button
                        type="submit"
                        className="edit-post-btn-primary"
                        disabled={isSubmitting || editedContent.trim() === initialContent.trim()}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditPostModal;