import { type JSX } from 'react';
import { Link } from 'react-router-dom';
import { type CommentData } from '../../types/commentType';
import Comment from './comment';
import './commentInFeed.css';

interface CommentInFeedProps {
    comment: CommentData;
    postId: {
        id: string;
        authorUsername: string;
    };
}

const CommentInFeed = ({ comment, postId }: CommentInFeedProps): JSX.Element => {
    return (
        <div className="feed-item-wrapper">
            <div className="replying-to-context">
                <p>
                    Replying to 
                    <Link to={`/post/${postId.id}`}>
                        @{postId.authorUsername}
                    </Link>
                </p>
            </div>
            {/* Render the actual comment using your existing component */}
            <Comment commentId={comment.id} postId={postId.id}/>
        </div>
    );
};

export default CommentInFeed;