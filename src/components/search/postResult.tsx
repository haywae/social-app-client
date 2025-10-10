import { type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PostSearchResult } from '../../slices/search/searchSlice';
import Post from '../posts/post'; 
import './postResult.css'; 
import { transformPostSearchResult } from '../../utils/searchUtils';

interface PostResultProps {
    post: PostSearchResult;
}

const PostResult = ({ post }: PostResultProps): JSX.Element => {
    const navigate = useNavigate();

    // The component is now much cleaner, with all logic in the utility function.
    const postDataForComponent = transformPostSearchResult(post);

    // The entire card is clickable and navigates to the post detail page
    const handleNavigate = () => {
        navigate(`/post/${post.publicId}`);
    };

    return (
        <div className="search-result-post-wrapper" onClick={handleNavigate}>
            {/* Render the consistent, main Post component */}
            <Post post={postDataForComponent} isGateway={true}/>
        </div>
    );
};

export default PostResult;