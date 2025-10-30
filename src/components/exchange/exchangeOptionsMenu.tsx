// src/components/exchange/ExchangeOptionsMenu.tsx
import { useEffect, useRef, type JSX } from 'react';
import { EditIcon, LinkIcon, CreatePostIcon, QRIcon } from '../../assets/icons';
import { openModal } from '../../slices/ui/uiSlice';
import { useDispatch } from 'react-redux';

interface ExchangeOptionsMenuProps {
    username: string | undefined;
    exchangeName: string | undefined;
    avatarUrl: string | undefined;
    onClose: () => void;
    onEditClick: () => void;
    onPostRatesClick: () => void;
}

const ExchangeOptionsMenu = ({ username, exchangeName, avatarUrl, onClose, onEditClick,onPostRatesClick }: ExchangeOptionsMenuProps): JSX.Element => {
    const menuRef = useRef<HTMLDivElement>(null);
    const exchangeUrl = `${window.location.origin}/view?exchange=${username}`;

    const dispatch = useDispatch();

    // Effect to close the menu if the user clicks outside of it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(exchangeUrl);
        onClose();
    };

    const handleShowQRCode = () => {
        dispatch(openModal({
            modalType: 'VIEW_QR_CODE',
            modalProps: {
                url: exchangeUrl,
                title: exchangeName ? `${exchangeName} Rates` : 'Share Exchange Rates',
                avatarUrl: avatarUrl,
            }
        }));
        onClose(); // Close the options menu
    };
    
    return (
        <div className="options-popover-container" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <ul className="menu-option-list">
                <li className="menu-option-item" onClick={onEditClick}>
                    <EditIcon />
                    <span>Edit Exchange Details</span>
                </li>
                <li className="menu-option-item" onClick={onPostRatesClick}>
                    <CreatePostIcon />
                    <span>Post My Rates</span>
                </li>
                <li className="menu-option-item" onClick={handleCopyLink}>
                    <LinkIcon />
                    <span>Copy link to rates</span>
                </li>
                <li className="menu-option-item" onClick={handleShowQRCode}>
                    <QRIcon />
                    <span>Show QR Code</span>
                </li>
            </ul>
        </div>
    );
};

export default ExchangeOptionsMenu;