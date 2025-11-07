import defaultAvatar from './assets/default-avatar.svg';

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL

export const DEVELOPER_MODE: boolean = import.meta.env.MODE === 'development';

export const MINIMUM_RATE_ROWS = 3;

export const DEFAULT_AVATAR_URL = defaultAvatar;

export const SOCKET_URL: string = import.meta.env.VITE_SOCKET_URL;

export const IMAGE_BASE_URL: string = import.meta.env.VITE_IMAGE_BASE_URL;

// Regex to find @username mentions (preceded by a space or start of string)
// This is updated to NOT capture a trailing period or other punctuation.
// It matches @, followed by chars, but must end in a letter, number, or hyphen.

export const MENTION_REGEX = /(^|\s)(@[\w.-]*[\w-]+)/g;
