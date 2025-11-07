import { type JSX } from 'react';

import './rightSidebar.css';

/**
 * The main container for the right sidebar of the application.
 * It displays a search bar, trending topics, and user suggestions.
 */
const RightSidebar = (): JSX.Element => {
    return (
        <aside className="right-sidebar-container">
            <div className="sidebar-module">
                <h3 className='sidebar-module-title'>About the Developer</h3>
                <p className="sidebar-module-text">
                    Hi, I'm Ayowole Badejo. I'm a full-stack developer passionate 
                    about building secure, scalable, and user-friendly web applications. 
                    This entire site, from the React frontend to the Python/Flask API, 
                    was built by me.
                </p>
                
                <div className="contact-info">
                    <h4>Get in Touch</h4>
                    <div className="contact-item">
                        <span role="img" aria-label="email">📧</span>
                        <a href="mailto:haywae35@gmail.com">
                            haywae35@gmail.com
                        </a>
                    </div>
                    <div className="contact-item">
                        <span role="img" aria-label="phone">📞</span>
                        <span>+90 (533) 8614114</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default RightSidebar;