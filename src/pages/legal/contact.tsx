import { useState, useEffect, type JSX, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector, useTitle } from '../../utils/hooks';
import { useLocation } from 'react-router-dom';
import { submitContactForm } from '../../thunks/legalThunks/contactFormThunk';
import { resetContactState } from '../../slices/ui/uiSlice';
import { LeftArrowIcon } from '../../assets/icons';
import { DEVELOPER_MODE } from '../../appConfig';
import './legalPages.css';

const ContactPage = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the form's loading and error state from the Redux store
    const { loading, error } = useAppSelector((state) => state.ui);

    // Local state for the form inputs
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    // This effect will run after a successful submission to reset the form
    useEffect(() => {
        if (loading === 'succeeded') {
            const timer = setTimeout(() => {
                // Reset form fields
                setName('');
                setEmail('');
                setSubject('');
                setMessage('');
                // Reset the Redux state back to 'idle'
                dispatch(resetContactState());
            }, 5000); // Keep the success message for 3 seconds

            return () => clearTimeout(timer);
        }
    }, [loading, dispatch]);


    const handleNavigate = () => {
        // Check if the user was navigated to this page from within the app
        if (location.key !== 'default') {
            // If there's a history stack, go back one step
            navigate(-1);
        } else {
            navigate('/'); // The public homepage
        }
    };

    // Handle the form submission by dispatching the thunk
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            // Dispatch the thunk with the form data and unwrap the result
            await dispatch(submitContactForm({ name, email, subject, message })).unwrap();
        } catch (err) {
            // Errors are already handled in the thunk and slice,
            // so we just need to catch the rejected promise here.
            DEVELOPER_MODE && console.error("Failed to submit contact form:", err);
        }
    };

    useTitle('Contact Us - WolexChange');

    // --- Render Logic ---
    return (
            <div className="legal-page-container">
                <header className="legal-page-header">
                    <button onClick={handleNavigate} className="legal-back-button"><LeftArrowIcon /></button>
                    <h1>Contact Us</h1>
                    <p className="subtitle">We'd love to hear from you. Please use the appropriate channel below.</p>
                </header>

                <div className="contact-grid">
                    <section className="legal-page-section contact-form-section">
                        <h2>General Inquiries</h2>
                        <p>For general questions or feedback, please fill out the form below or email us at <a href="mailto:contact@wolexchange.com">contact@wolexchange.com</a>.</p>
                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="subject">Subject</label>
                                <input type="text" id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={5}></textarea>
                            </div>
                            <button type="submit" className="contact-submit-btn" disabled={loading === 'pending'}>
                                {loading === 'pending' ? 'Sending...' : 'Send Message'}
                            </button>
                            {loading === 'succeeded' && <p className="form-success">Thank you! Your message has been sent.</p>}
                            {loading === 'failed' && <p className="form-error">{error || 'Something went wrong. Please try again.'}</p>}
                        </form>
                    </section>

                    <section className="legal-page-section contact-details-section">
                        <h2>Other Inquiries</h2>
                        <p>For specific issues, please contact the relevant department:</p>
                        <ul className="contact-list">
                            <li>
                                <strong>Support:</strong> For technical issues or help using the app.<br />
                                <a href="mailto:support@wolexchange.com">support@wolexchange.com</a>
                            </li>
                            <li>
                                <strong>Privacy:</strong> For questions about your data or our privacy policy.<br />
                                <a href="mailto:privacy@wolexchange.com">privacy@wolexchange.com</a>
                            </li>
                            <li>
                                <strong>Legal:</strong> For legal notices or copyright (DMCA) inquiries.<br />
                                <a href="mailto:legal@wolexchange.com">legal@wolexchange.com</a>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
    );
};

export default ContactPage;

