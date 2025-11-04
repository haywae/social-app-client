import { type JSX, useState } from 'react';
import { useAppDispatch } from '../../utils/hooks';
import { deleteConversation } from '../../thunks/messaging/deleteConversationThunk';
import Modal from './modal';
import { type ConversationData } from '../../types/conversationType';
import './confirmPostDeleteModal.css'

interface ConfirmConversationDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversation: ConversationData;
}

const ConfirmConversationDeleteModal = ({ isOpen, onClose, conversation }: ConfirmConversationDeleteModalProps): JSX.Element => {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await dispatch(deleteConversation(conversation.id)).unwrap();
            // Success! The slice will remove it from the list.
            onClose(); 
        } catch (error) {
            console.error("Failed to delete conversation:", error);
            // We could dispatch a global error here if needed
            onClose(); // Close even on failure
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title='Remove Conversation'>
            {/* You can reuse styles from deleteAccountModal.css or create new ones */}
            <div className="delete-account-modal">
                <p>
                    Are you sure you want to remove this conversation with <strong>{conversation.name}</strong>?
                    <br /><br />
                    You will no longer see it in your chat list.
                </p>
                <div className="delete-modal-actions">
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={onClose} 
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        className="btn-danger" 
                        onClick={handleDelete} 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Hiding...' : 'Hide Chat'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmConversationDeleteModal;