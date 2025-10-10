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