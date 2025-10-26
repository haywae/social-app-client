import { type JSX } from 'react';
import { Link } from 'react-router-dom';
import { MENTION_REGEX } from '../../appConfig';

interface FormattedContentProps {
    content: string;
}

/**
 * Renders text content, parsing @mentions and turning them into
 * clickable <Link> components.
 */
const FormattedContent = ({ content }: FormattedContentProps): JSX.Element => {
    if (!content) {
        return <></>;
    }

    // Split the text into parts: plain text and @mentions
    const parts = content.split(MENTION_REGEX);

    return (
        <span className="formatted-content">
            {parts.map((part, index) => {
                if (part.startsWith('@')) {
                    const username = part.substring(1);
                    return (
                        <Link
                            key={`${username}-${index}`}
                            to={`/profile/${username}`}
                            className="mention-link"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part}
                        </Link>
                    );
                }
                // This will handle the preceding spaces or newlines
                // We use a React Fragment to render the text part
                return <React.Fragment key={index}>{part}</React.Fragment>;
            })}
        </span>
    );
};

import React from 'react';
export default FormattedContent;
