/**
 * Extracts hashtags from a string and returns the cleaned content
 * along with an array of the found tags.
 * * @param content The raw text string from the user.
 * @returns An object containing the cleaned content and an array of tags.
 */
export const extractAndCleanContent = (content: string): { cleanedContent: string; tags: string[] } => {
    if (!content) {
        return { cleanedContent: '', tags: [] };
    }

    // Regular expression to find hashtags (e.g., #react, #typescript)
    const hashtagRegex = /#(\w+)/g;
    
    // 1. Find all matches and extract the tag names (without the '#')
    const tags = (content.match(hashtagRegex) || []).map(tag => tag.substring(1));
    
    // 2. Remove the hashtags from the content string and trim any lingering whitespace
    const cleanedContent = content.replace(hashtagRegex, '').trim();

    return {
        cleanedContent,
        tags: [...new Set(tags)] // Return only unique tags
    };
};