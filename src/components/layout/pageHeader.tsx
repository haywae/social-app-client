import { type JSX } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LeftArrowIcon } from '../../assets/icons';
import './pageHeader.css'; 

interface PageHeaderProps {
    title: string;
    showBackButton?: boolean;
}

const PageHeader = ({ title, showBackButton = false }: PageHeaderProps): JSX.Element => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigate = () => {
        // Check if the user was navigated to this page from within the app
        if (location.key !== 'default') {
            // If there's a history stack, go back one step
            navigate(-1);
        } else {
            navigate('/'); // The public homepage
        }
    };
    return (
        <header className="page-header">
            {showBackButton && (
                <button onClick={handleNavigate} className="page-header-back-button">
                    <LeftArrowIcon />
                </button>
            )}
            <h1 className="page-header-title">{title}</h1>
        </header>
    );
};

export default PageHeader;