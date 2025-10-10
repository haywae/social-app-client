/**
 * Parses a string of content and extracts all hashtags.
 * @param content The text to parse (e.g., "Hello #react and #typescript!").
 * @returns An array of tag strings without the '#' (e.g., ['react', 'typescript']).
 */
export const parseTags = (content: string): string[] => {
    // This regex finds all words that start with '#'
    const hashtagRegex = /#(\w+)/g;
    // match() returns an array like ['#react', '#typescript'] or null
    const matches = content.match(hashtagRegex);
    
    if (!matches) {
        return []; // Return an empty array if no tags are found
    }
    
    // Remove the '#' from the beginning of each tag
    return matches.map(tag => tag.substring(1));
};