import '../styles/infoPage.css'
import { useTitle } from '../utils/hooks';

/**
 * A component to display when a user navigates to a URL that does not exist.
 * It provides a clear 404 message and a link to return to the homepage.
 */
const InfoPage = () => {

    useTitle('Info')
    return (
        <div className="infoPage-container">
            <div className='info-section'>
                <h3 className='info-title'>Testing & Demo Tips</h3>

                <p className='info-text'>
                    To test the full social and real-time features, please use the
                    three pre-built demo accounts.
                </p>
                <p className='info-text'>
                    The common password for all accounts is: <code>User*123</code>
                </p>

                <ul className="demo-accounts-list">
                    <li>username: <code>user1</code></li>
                    <li>username: <code>user2</code></li>
                    <li>username: <code>user3</code></li>
                </ul>

                <p className='info-text'>
                    <strong>See real-time updates:</strong> Log in with two different accounts
                    (e.g., `user1` and `user2`) in two separate browser windows or tabs.
                    Actions you take as one user (like, follow, comment) will trigger
                    instant notifications for the other.
                </p>
            </div>

            <div className='info-section'>
                <h3 className='info-title'>About the Developer</h3>
                <p className="info-text">
                    Hi, I'm Ayowole Badejo. I'm a full-stack developer passionate
                    about building secure, scalable, and user-friendly web applications.
                    This entire site, from the React frontend to the Python/Flask API,
                    was built by me.
                </p>
            </div>

            <div className="info-section">
                <h3 className='info-title'>Get in Touch</h3>
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
    );
};

export default InfoPage;