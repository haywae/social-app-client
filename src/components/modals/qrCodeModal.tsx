import type { JSX } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from './modal';
import './qrCodeModal.css';
import { DEFAULT_AVATAR_URL, IMAGE_BASE_URL } from '../../appConfig';

interface QRCodeModalProps {
    url: string;
    title: string;
    avatarUrl?: string;
    onClose: () => void;
    isOpen: boolean;
}

const QRCodeModal = ({ avatarUrl, isOpen, title, url, onClose }: QRCodeModalProps): JSX.Element => {
    const finalAvatarUrl = avatarUrl 
        ? `${IMAGE_BASE_URL}/${avatarUrl}` 
        : DEFAULT_AVATAR_URL;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="qr-code-modal-content">
                    <img
                        src={finalAvatarUrl}
                        alt={title}
                        className="qr-code-avatar user-avatar avatar-lg"
                    />
                <div className="qr-code-wrapper">
                    <QRCodeSVG
                        value={url}
                        size={256}
                        level={"L"}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default QRCodeModal;