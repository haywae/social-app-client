// src/components/exchange/ExchangeOptionsMenu.tsx
import { useEffect, useRef, type JSX } from 'react';
import { EditIcon, LinkIcon } from '../../assets/icons';

interface ExchangeOptionsMenuProps {
    username: string | undefined;
    onClose: () => void;
    onEditClick: () => void;
}

const ExchangeOptionsMenu = ({ username, onClose, onEditClick }: ExchangeOptionsMenuProps): JSX.Element => {
    const menuRef = useRef<HTMLDivElement>(null);
    const exchangeUrl = `${window.location.origin}/view?exchange=${username}`;

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
    
    return (
        <div className="options-popover-container" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <ul className="menu-option-list">
                <li className="menu-option-item" onClick={onEditClick}>
                    <EditIcon />
                    <span>Edit Exchange Details</span>
                </li>
                <li className="menu-option-item" onClick={handleCopyLink}>
                    <LinkIcon />
                    <span>Copy link to rates</span>
                </li>
            </ul>
        </div>
    );
};

export default ExchangeOptionsMenu;