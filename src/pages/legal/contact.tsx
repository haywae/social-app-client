import { useState, type JSX, type FormEvent } from 'react';
import './legalPages.css'; // We'll use a shared stylesheet

const ContactPage = (): JSX.Element => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        // In a real application, you would send this data to a backend endpoint
        // that uses a service like SendGrid or Mailgun to email you.
        // For now, we'll simulate a successful submission.
        console.log({ name, email, subject, message });
        setTimeout(() => {
            setStatus('success');
            // Reset form
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
        }, 1000);
    };

    return (
        <div className="legal-page-container">
            <header className="legal-page-header">
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
                        <button type="submit" className="contact-submit-btn" disabled={status === 'submitting'}>
                            {status === 'submitting' ? 'Sending...' : 'Send Message'}
                        </button>
                        {status === 'success' && <p className="form-success">Thank you! Your message has been sent.</p>}
                        {status === 'error' && <p className="form-error">Something went wrong. Please try again.</p>}
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
