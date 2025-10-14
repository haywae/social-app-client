import { type JSX } from "react";
import { NavLink } from "react-router-dom";
import "./tabbedHeader.css";

// Define the shape of a single tab
interface Tab {
    path: string;
    label: string;
}

// Define the props for our component
interface TabbedHeaderProps {
    tabs: Tab[];
}

const TabbedHeader = ({ tabs }: TabbedHeaderProps): JSX.Element => {

    const handleTabClick = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Optional: for a smooth scrolling effect
        });
    };
    return (
        <div className="tabbed-header">
            <nav className="tab-nav">
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.path}
                        to={tab.path}
                        className={({ isActive }) => 
                            isActive ? "tab-link active" : "tab-link"
                        }
                        onClick={handleTabClick}
                        end // Use 'end' for the root path to prevent it from matching sub-paths
                    >
                        {tab.label}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default TabbedHeader;