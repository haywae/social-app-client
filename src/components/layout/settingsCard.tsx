import { Link } from 'react-router-dom';
import './settingsCard.css'; // Or a dedicated card CSS file

// Reusable component for each clickable settings card
const SettingsCard = ({ title, description, to }: { title: string, description: string, to: string }) => (
    <Link to={to} className="settings-card">
        <div className="card-info">
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
        <span className="card-arrow">&gt;</span>
    </Link>
);

export default SettingsCard;