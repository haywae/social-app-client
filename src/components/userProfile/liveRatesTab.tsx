import { type JSX, useState, useRef, useEffect } from 'react';
import { type ExchangeData } from '../../types/exchange';
import { allCurrencies } from '../../assets/currencies';
import { DEFAULT_AVATAR_URL } from '../../appConfig';
import { EllipseIcon, LinkIcon } from '../../assets/icons';
import './liveRatesTab.css'; 

interface LiveRatesDisplayProps {
    exchangeData: ExchangeData;
}

/**
 * A component that displays a user's live exchange rates.
 */
const LiveRatesTab = ({ exchangeData }: LiveRatesDisplayProps): JSX.Element => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const formattedDate = new Date(exchangeData.last_updated).toLocaleString();
    const baseCurrencyFlagCode = allCurrencies.find(c => c.iso3 === exchangeData.base_currency)?.iso2;
    const baseCountryFlag = `https://flagcdn.com/w20/${baseCurrencyFlagCode?.toLowerCase()}.png`;
    
    // The shareable URL can only be constructed if the username is available
    const exchangeUrl = `${window.location.origin}/view?exchange=${exchangeData.username}`;
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCopyLink = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!exchangeUrl) return; // Guard against missing URL

        await navigator.clipboard.writeText(exchangeUrl);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
            setIsMenuOpen(false);
        }, 1500);
    };

    return (
        <div className="live-rates-container">
            <header className="live-rates-header">
                <div className="live-rates-user-info">
                        <img src={exchangeData.avatarUrl || DEFAULT_AVATAR_URL} alt="user avatar" className="user-avatar avatar-sm" />
                    <div className="live-rates-details">
                        <h3>{exchangeData.name}</h3>
                        <p>Base: <strong>{exchangeData.base_currency}</strong> <img src={baseCountryFlag} alt="base-country-flag" className='flag-img'/></p>
                    </div>
                </div>
                <div className="live-rates-actions">
                    <button className="icon-action-button" onClick={() => setIsMenuOpen(true)}>
                        <EllipseIcon />
                    </button>
                    {isMenuOpen && (
                        <div ref={menuRef} className="options-popover-container">
                            <ul className="menu-option-list">
                                <li className="menu-option-item" onClick={handleCopyLink}>
                                    <LinkIcon />
                                    <span>{copied ? 'Copied!' : 'Copy link to rates'}</span>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </header>
            <table className="rates-table">
                <thead>
                    <tr>
                        <th>Currency</th>
                        <th>Buy</th>
                        <th>Sell</th>
                    </tr>
                </thead>
                <tbody>
                    {exchangeData.rates.map((rate) => {
                        const currencyFlagCode = allCurrencies.find(c => c.iso3 === rate.currency)?.iso2;
                        const countryFlag = `https://flagcdn.com/w20/${currencyFlagCode?.toLowerCase()}.png`;
                        return (
                            <tr key={rate.currency}>
                                <td>
                                    <div className='rates-currency'>
                                        <img src={countryFlag} alt="currency-rate-image" className='flag-img'/>
                                        <span>{rate.currency}</span>
                                    </div>
                                </td>
                                <td>{rate.buy.toFixed(2)}</td>
                                <td>{rate.sell.toFixed(2)}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <footer className="live-rates-footer">
                <p>Last Updated: {formattedDate}</p>
            </footer>
        </div>
    );
};

export default LiveRatesTab;

