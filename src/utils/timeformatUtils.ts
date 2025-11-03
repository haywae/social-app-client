/**
 * A consolidated and accurate helper function to format a timestamp into a relative time string.
 * This should be used as the primary function for "time ago" formatting.
 * It correctly uses Math.floor() to prevent rounding errors.
 *
 * @param timestamp - An ISO 8601 date string.
 * @returns A formatted string like "5s", "12m", "3h", "2d", or "Jul 15".
 */
export const formatRelativeTimestamp = (timestamp: string): string => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return `${diffSeconds}s`;
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    // For timestamps older than a week, show the date
    return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Formats a timestamp into a detailed string with time and date.
 * e.g., "6:04 PM · Sep 20, 2025"
 * * @param timestamp - An ISO 8601 date string.
 * @returns A detailed time and date string.
 */
export const formatDetailedTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    // e.g., "6:04 PM"
    const time = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
    });
    // e.g., "Sep 20, 2025"
    const day = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric' 
    });
    return `${time} · ${day}`;
};

import { parseISO, isToday, isYesterday, isThisWeek, format } from 'date-fns';

export const formatChatTimestamp = (timestamp: string): string => {
    try {
        const date = parseISO(timestamp); // Converts ISO string to Date object

        if (isToday(date)) {
            return format(date, 'p'); // 'p' = Locale-aware time (e.Sg., 10:30 AM)
        }
        if (isYesterday(date)) {
            return "Yesterday";
        }
        if (isThisWeek(date, { weekStartsOn: 0 })) { // 0 = Sunday
            return format(date, 'EEEE'); // 'EEEE' = Full day name (e.g., Sunday)
        }
        
        return format(date, 'P'); // 'P' = Locale-aware date (e.g., 11/02/2025)

    } catch (error) {
        console.error("Error formatting timestamp:", error);
        return "Invalid Date";
    }
};