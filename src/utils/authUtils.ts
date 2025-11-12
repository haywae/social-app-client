import { refreshToken } from "../thunks/authThunks/refreshTokenThunk";
import type { AppDispatch } from "../store";
import { DEVELOPER_MODE } from "../appConfig";
/** Function clears {accessTokenExp, refreshTokenExp, csrfAccessToken, csrfRefreshToken} from local storage */
export function clearLocalStorage(): void{
    localStorage.removeItem('accessTokenExp');
    localStorage.removeItem('csrfAccessToken'); 
    localStorage.removeItem('csrfRefreshToken');
}

/** Function sets {accessTokenExp, refreshTokenExp, csrfAccessToken, csrfRefreshToken} in local storage */
export function setLocalStorage(
    accessTokenExp: string | null,
    csrfAccessToken: string | null,
    csrfRefreshToken: string | null
): void {
    if (accessTokenExp) localStorage.setItem('accessTokenExp', accessTokenExp);
    if (csrfAccessToken) localStorage.setItem('csrfAccessToken', csrfAccessToken);
    if (csrfRefreshToken) localStorage.setItem('csrfRefreshToken', csrfRefreshToken);
}

function formatMilliseconds(ms: number) {
  // 1. Get total seconds
  const totalSeconds = Math.floor(ms / 1000);

  // 2. Get the seconds part (remainder)
  const seconds = totalSeconds % 60;

  // 3. Get total minutes
  const minutes = Math.floor(totalSeconds / 60);

  // 4. Pad the seconds with a '0' if it's a single digit
  const paddedSeconds = seconds.toString().padStart(2, '0');

  return `${minutes}:${paddedSeconds}`;
}

const localTime = () => new Date().toLocaleTimeString()
/**
 * Schedules a proactive token refresh, combining robustness and modern practices.
 * It calculates the delay until the token is about to expire, handles edge cases,
 * and sets a timeout to dispatch the refreshToken thunk automatically.
 *
 * @param dispatch - The Redux dispatch function.
 * @param accessTokenExp - The expiration timestamp (in seconds) of the access token. Tbe provided immediately the login is successful.
 */
export const scheduleProactiveRefresh = (dispatch: AppDispatch, accessTokenExpInput: string | number | null | undefined) => {
    // --- 1. Clear any existing timer to prevent multiple refresh loops ---
    const existingTimeoutId = localStorage.getItem('refreshTokenTimeoutId');
    if (existingTimeoutId) {
        clearTimeout(Number(existingTimeoutId));
        localStorage.removeItem('refreshTokenTimeoutId'); 
    }

    // --- 2. Validate and parse the expiration time ---
    if (!accessTokenExpInput) {
        return;
    }
    
    const accessTokenExp = typeof accessTokenExpInput === 'string' 
        ? parseInt(accessTokenExpInput, 10) 
        : accessTokenExpInput;

    if (isNaN(accessTokenExp)) {
        return;
    }

    // --- 3. Calculate the delay for the refresh ---
    const expirationTimeMs = accessTokenExp * 1000; // Convert Unix timestamp (seconds) to milliseconds
    const nowMs = Date.now();
    const timeLeftMs = expirationTimeMs - nowMs;

    // --- 4. Define a safety margin to avoid scheduling too close to expiration ---
    // This ensures that the refresh is scheduled with a buffer to account for network delays and processing
    const SAFETY_MARGIN_MS = 1 * 60 * 1000; 

    // --- 5. Check if the token is already expired or expires within the new safety margin ---
    if (timeLeftMs <= SAFETY_MARGIN_MS) {
        return; 
    }

    // --- 6. Schedule the refresh ---
    const timeToRefreshMs = timeLeftMs - SAFETY_MARGIN_MS;

// 2. Create a new Date object
    const expiryObject = new Date(expirationTimeMs).toLocaleString();

    DEVELOPER_MODE && console.log(localTime(), `- @SCHEDULE_PROACTIVE_REFRESH: Token set to expire in ${expiryObject}\nScheduled the refresh to fire in (${formatMilliseconds(timeToRefreshMs)})`)
    const timeoutId = setTimeout(() => {
        DEVELOPER_MODE && console.log(localTime(), '- @SCHEDULE_PROACTIVE_REFRESH: dispatching the REFRESH_THUNK')
        dispatch(refreshToken());
        localStorage.removeItem('refreshTokenTimeoutId'); 
    }, timeToRefreshMs);

    localStorage.setItem('refreshTokenTimeoutId', String(timeoutId));
};


