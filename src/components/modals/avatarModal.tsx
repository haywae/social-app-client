import { type JSX } from 'react';
import Modal from '../modals/modal'; 
import './avatarModal.css'; 

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
}

const AvatarModal = ({ isOpen, onClose, src, alt }: AvatarModalProps): JSX.Element => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className='avatar-viewer'>
      <div className="avatar-modal-content">
        <img src={src} alt={alt} />
      </div>
    </Modal>
  );
};

export default AvatarModal;