import { useAppSelector, useAppDispatch } from '../../utils/hooks';
import { closeModal } from '../../slices/ui/uiSlice';
import AvatarModal from './avatarModal';
import ConfirmPostDeleteModal from './confirmPostDeleteModal';
import EditPostModal from './editPostModal';
import { DEVELOPER_MODE } from '../../appConfig';


const ModalManager = () => {
  const dispatch = useAppDispatch();
  const { modalType, modalProps } = useAppSelector((state) => state.ui);

  const handleClose = () => dispatch(closeModal());

  switch (modalType) {
    case 'VIEW_AVATAR': {
      if ('src' in modalProps && 'alt' in modalProps) {
        return <AvatarModal
          isOpen={true}
          onClose={handleClose}
          src={modalProps.src}
          alt={modalProps.alt}
        />;
      }
      DEVELOPER_MODE && console.error('VIEW_AVATAR modal opened without src or alt.');
      return null;
    }

    case 'EDIT_POST': {
      if ('post' in modalProps) {
        return <EditPostModal
          isOpen={true}
          onClose={handleClose}
          post={modalProps.post}
        />;
      }
      DEVELOPER_MODE && console.error('EDIT_POST modal opened without a post prop.');
      return null;
    }

    case 'CONFIRM_DELETE_POST': {
      if ('post' in modalProps) {
        return <ConfirmPostDeleteModal
          isOpen={true}
          onClose={handleClose}
          post={modalProps.post}
        />;
      }
      DEVELOPER_MODE && console.error('CONFIRM_DELETE_POST modal opened without a post prop.');
      return null;
    }

    default:
      return null;
  }
};

export default ModalManager;