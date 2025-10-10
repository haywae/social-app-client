import defaultAvatar from './assets/default-avatar.svg';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export  const DEVELOPMENT_MODE = import.meta.env.MODE === 'development';

export const MINIMUM_RATE_ROWS = 3;

export const DEFAULT_AVATAR_URL = defaultAvatar;
