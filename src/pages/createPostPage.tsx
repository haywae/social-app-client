import { type JSX, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../utils/hooks";
import { parseTags } from "../utils/tagsUtils";
import { useNavigate } from "react-router-dom";
import { CloseIcon } from "../assets/icons";
import { createPost  } from "../thunks/postsThunks/createPostThunk";
import { resetCreatePostStatus, setCreatePostContent } from "../slices/posts/postsSlice";
import { setError } from "../slices/ui/uiSlice";
import "../styles/createPostPage.css"
import withAuth from "../components/common/withAuth";
import { DEFAULT_AVATAR_URL } from "../appConfig";

const CreatePostPage = () : JSX.Element | null => {

    // Get all necessary state from the posts slice
    const { loading, createPostContent, createPostStatus } = useAppSelector((state) => state.posts);
    const { user: authUser } = useAppSelector((state) => state.auth);


    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // --- Effect to handle navigation after successful post ---
    useEffect(() => {
        if (createPostStatus === 'succeeded') {
            // Navigate to the home page or the new post's page
            navigate('/');
            // Reset the status for the next time the page is opened
            dispatch(resetCreatePostStatus());
        }
    }, [createPostStatus, navigate, dispatch]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch(setCreatePostContent(e.target.value));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createPostContent.trim()) return;
        const tags = parseTags(createPostContent);
        // The thunk will handle success/failure and update the state
        try {
            await dispatch(createPost({ content: createPostContent, tags})).unwrap();
        } catch(err: any) {
            dispatch(setError(err))
        }

    };

    const handleCloseButton = () => {
        // Clear content and navigate away
        dispatch(setCreatePostContent(''));
        navigate(-1); // Go back to the previous page
    }

    return (
        <div className="create-post-container">
            {/*SECTION 1: HEADER */}
            <header className="create-post-header">
                <CloseIcon onClick={handleCloseButton} />
                <h2>Create Post</h2>
            </header>
            {/* SECTION 2: BODY (User avatar and text area) */}
            <div className="create-post-body">
                <div className="user-info">
                    <img src={authUser?.profilePictureUrl || DEFAULT_AVATAR_URL} alt="user's avatar"  className="user-avatar avatar-md"/>
                </div>
                <div className="text-content">
                    <textarea
                        id="createPost"
                        name="createPost"
                        placeholder="Share your thoughts"
                        value={createPostContent}
                        onChange={handleContentChange}
                        required
                        autoFocus
                    />
                </div>
                <div className="create-post-footer">
                    <span className="char-counter">{createPostContent.length} Characters</span>
                    <button onClick={handleSubmit} className="submit-post-button" disabled={loading === 'pending' || !createPostContent.trim()}>
                        {loading === 'pending' ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default withAuth(CreatePostPage);