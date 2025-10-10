/** 
 * ============================================================================
 * ========== COMMENT REPLIES AND THREADS WILL BE IMPLEMENTED LATER ===========
 * ============================================================================
import { useState, useEffect, useRef, useMemo, type JSX } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../utils/hooks';
import { parseTags } from '../utils/tagsUtils';
import { createComment } from '../thunks/commentsThunks/createCommentThunk';
import { fetchThread } from '../thunks/commentsThunks/fetchThreadThunk';
import { clearComments } from '../slices/comments/commentsSlice';
import Comment from '../components/comments/comment';
import withAuth from '../components/common/withAuth';
import { LeftArrowIcon, CloseIcon } from '../assets/icons';
import '../styles/postDetailPage.css'; 

const ThreadPage = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { postId, commentId } = useParams<{ postId: string, commentId: string }>();

    // --- State Selection ---
    const { 
        commentsById,
        replyIdsByParentId,
        parentComment,
        topLevelCommentIds, 
        loading, 
        error,
    } = useAppSelector((state) => state.comments);
    const loggedInUser = useAppSelector((state) => state.auth.user);
    
    // 1. Get the root comment's ID and then its full data object
    const rootCommentId = topLevelCommentIds[0];
    const rootComment = rootCommentId ? commentsById[rootCommentId] : null;

    // --- Local State ---
    const [commentContent, setCommentContent] = useState('');
    const [replyingTo, setReplyingTo] = useState<{ username: string; commentId: string } | null>(null);

    // Create a ref for the textarea element
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    

    // 3. Use useMemo to calculate the linear thread path
    const linearThreadIds = useMemo(() => {
        if (!rootCommentId) return [];

        const path: string[] = [];
        let currentId: string | undefined = rootCommentId;

        // Traverse the tree, always picking the first reply to create a linear path
        while (currentId && commentsById[currentId]) {
            path.push(currentId);
            const replies: string[] | undefined = replyIdsByParentId[currentId];
            currentId = replies && replies.length > 0 ? replies[0] : undefined;
        }
        return path;
    }, [rootCommentId, commentsById, replyIdsByParentId]);

    useEffect(() => {
        if (commentId) {
            dispatch(fetchThread({ commentId }));
        }
        return () => {
            dispatch(clearComments());
        };
    }, [commentId, dispatch]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim() || !postId || !rootCommentId) return;

        const tags = parseTags(commentContent);
        const result = await dispatch(createComment({
            postId,
            content: commentContent,
            parent_id: replyingTo?.commentId ?? rootCommentId, // Default to replying to the root
            tags: tags
        }));

        if (createComment.fulfilled.match(result)) {
            setCommentContent('');
            setReplyingTo(null);
        }
    };

    const handleSetReplyTarget = (target: { username: string; commentId: string }) => {
        setReplyingTo(target);
        // Use the ref to focus the textarea
        textAreaRef.current?.focus();
    };

    // --- Render Logic ---
    if (loading === 'pending' || loading === 'idle') {
        return <div className="detail-message">Loading thread...</div>;
    }

    if (error || !rootComment) { // Check for rootComment data
        return (
            <div className="detail-page-container">
                <header className="detail-header">
                    <button onClick={() => navigate(-1)} className="back-button"><LeftArrowIcon /></button>
                    <h2>Thread not found</h2>
                </header>
                <div className="detail-message">
                    <p>This thread may have been deleted or the link is incorrect.</p>
                </div>
            </div>
        );
    }
*/
//     return (
//         <div className="detail-page-container">
//             <header className="detail-header">
//                 <button onClick={() => navigate(-1)} className="back-button">{<LeftArrowIcon />}</button>
//                 <h2>Thread</h2>
//             </header>
            
//             <div className="detail-scroll-area">
//                 {/* 2. Refined parent comment link */}
//                 {parentComment && (
//                     <div className="parent-comment-link">
//                         <Link to={`/posts/${postId}/thread/${parentComment.id}`}>
//                             Replying to @{parentComment.authorUsername}
//                         </Link>
//                     </div>
//                 )}
//                 {/* 4. Map over the new linearThreadIds array */}
//                 <div className="linear-thread-view">
//                     {linearThreadIds.map(id => (
//                         <Comment 
//                             key={id} 
//                             commentId={id} 
//                             postId={postId}
//                             isDetailedView={true}
//                             depth={0}
//                             onSetReply={handleSetReplyTarget}
//                         />
//                     ))}
//                 </div>
//             </div>
            
//             <div className="create-comment-section">
//                 {/* CASE 1: Replying to a specific child comment */}
//                 {replyingTo && (
//                     <div className="replying-to-banner">
//                         <span>
//                             {replyingTo.username === loggedInUser?.username
//                                 ? "Replying to your comment"
//                                 : `Replying to @${replyingTo.username}`
//                             }
//                         </span>
//                         <CloseIcon
//                             onClick={() => setReplyingTo(null)}
//                             className='cancel-reply-button' 
//                         />
//                     </div>
//                 )}

//                 {/* 3. FIX: Logic for replying to the root comment of the thread */}
//                 {!replyingTo && (
//                     <div className="replying-to-banner">
//                         <span>
//                             {rootComment.authorUsername === loggedInUser?.username
//                                 ? "Add another reply"
//                                 : `Replying to @${rootComment.authorUsername}`
//                             }
//                         </span>
//                     </div>
//                 )}
//                 <div className="comment-input-area">
//                     <textarea
//                         ref={textAreaRef}
//                         className="comment-textarea"
//                         value={commentContent}
//                         onChange={(e) => setCommentContent(e.target.value)}
//                         placeholder="Post your reply"
//                         rows={1} 
//                     />
//                     <button onClick={handleCommentSubmit} className="btn-primary comment-submit-btn" disabled={!commentContent.trim()}>Reply</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default withAuth(ThreadPage);

// ============================================================================
// ========== COMMENT REPLIES AND THREADS WILL BE IMPLEMENTED LATER ===========
// ============================================================================