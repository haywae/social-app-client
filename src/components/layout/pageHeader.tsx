import { type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeftArrowIcon } from '../../assets/icons';
import './pageHeader.css'; 

interface PageHeaderProps {
    title: string;
    showBackButton?: boolean;
}

const PageHeader = ({ title, showBackButton = false }: PageHeaderProps): JSX.Element => {
    const navigate = useNavigate();

    return (
        <header className="page-header">
            {showBackButton && (
                <button onClick={() => navigate(-1)} className="page-header-back-button">
                    <LeftArrowIcon />
                </button>
            )}
            <h1 className="page-header-title">{title}</h1>
        </header>
    );
};

export default PageHeader;