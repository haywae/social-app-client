import { useAppSelector, useAppDispatch } from '../../utils/hooks';
import { closeModal } from '../../slices/ui/uiSlice';
import ReplyModal from './replyModal';
import AvatarModal from './avatarModal';
import ConfirmPostDeleteModal from './confirmPostDeleteModal';
import ConfirmCommentDeleteModal from './confirmCommentDeleteModal';
import EditPostModal from './editPostModal';
import EditCommentModal from './editCommentModal';
import DeleteAccountModal from './deleteAccountModal';
import ConnectionsModal from './connectionsModal';
import { EditExchangeModal } from './editExchangeModal';
import QRCodeModal from './qrCodeModal';
import NewChatModal from './newChatModal';
import { DEVELOPER_MODE } from '../../appConfig';

const ModalManager = () => {
  const dispatch = useAppDispatch();
  const { modalType, modalProps } = useAppSelector((state) => state.ui);

  const handleClose = () => dispatch(closeModal());

  switch (modalType) {
    case 'REPLY': {
      if ('target' in modalProps && 'postId' in modalProps) {
        return <ReplyModal
          isOpen={true}
          onClose={handleClose}
          target={modalProps.target}
          postId={modalProps.postId}
        />;
      }
      DEVELOPER_MODE && console.error('REPLY modal opened without target or postId.');
      return null;
    }

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

    case 'EDIT_COMMENT': {
      if ('comment' in modalProps) {
        return <EditCommentModal
          isOpen={true}
          onClose={handleClose}
          comment={modalProps.comment}
        />;
      }
      DEVELOPER_MODE && console.error('EDIT_COMMENT modal opened without a comment prop.');
      return null;
    }

    case 'CONFIRM_DELETE_COMMENT': {
      if ('comment' in modalProps && 'postId' in modalProps) {
        return <ConfirmCommentDeleteModal
          isOpen={true}
          onClose={handleClose}
          comment={modalProps.comment}
          postId={modalProps.postId}
        />;
      }
      DEVELOPER_MODE && console.error('CONFIRM_DELETE_COMMENT modal opened without comment or postId.');
      return null;
    }

    case 'EDIT_EXCHANGE_DETAILS': {
      if ('exchangeData' in modalProps) {
        return <EditExchangeModal
          isOpen={true}
          onClose={handleClose}
          exchangeData={modalProps.exchangeData}
        />;
      }
      DEVELOPER_MODE && console.error('EDIT_EXCHANGE_DETAILS modal opened without exchangeData.');
      return null;
    }

    case 'CONFIRM_DELETE_ACCOUNT': {
      return <DeleteAccountModal isOpen={true} onClose={handleClose} />;
    }

    case 'CONNECTIONS_LIST': {
      if ('username' in modalProps && 'initialTab' in modalProps) {
        return <ConnectionsModal
          isOpen={true}
          onClose={handleClose}
          username={modalProps.username}
          initialTab={modalProps.initialTab as 'followers' | 'following'}
        />;
      }
      DEVELOPER_MODE && console.error('CONNECTIONS_LIST modal opened without username or listType.');
      return null;
    }

    case 'VIEW_QR_CODE': {
      if ('url' in modalProps && 'title' in modalProps) {
        return <QRCodeModal
          avatarUrl={modalProps.avatarUrl}
          url={modalProps.url}
          title={modalProps.title}
          isOpen={true}
          onClose={handleClose}
        />;
      }
      DEVELOPER_MODE && console.error('VIEW_QR_CODE modal opened without url or title.');
      return null;
    }

    case 'NEW_CHAT': {
      return <NewChatModal
        isOpen={true}
        onClose={handleClose}
      />;
    }

    default:
      return null;
  }
};

export default ModalManager;