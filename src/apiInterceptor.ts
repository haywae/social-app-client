import store from './store';
import { refreshToken, type RefreshReject } from './thunks/authThunks/refreshTokenThunk';
import { logoutUser } from './thunks/authThunks/logoutThunk';
import { API_BASE_URL, DEVELOPER_MODE } from './appConfig';
import { connectSocket } from './services/socketService';

// --- 1. Define the types for your API service ---

// The complete shape of the 'api' object: a callable function
type ApiService = {
    (url: string, options?: RequestInit): Promise<Response>;
};

// An array of promises containing requests to be fetched later on
let failedQueue: Array<{
    resolve: (value?: any) => void,
    reject: (reason?: any) => void
}> = [];

// A function that resolves or rejects promises from the failed queue array and reset the queue.
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = []
}

// 
const localTime = () => new Date().toLocaleTimeString()
// --- Cross-tab refresh lock ---
const REFRESH_LOCK_KEY = 'isRefreshingToken';
// --- Refresh thunk times out after 9s, let's add a buffer ---
const REFRESH_LOCK_TIMEOUT = 11000;


/**
 * An API Interceptor that refreshes the refresh tokens if the original request failed due authentication(401 Error) \
 *  To avoid infinte loops, thunks used by the Api Interceptor cannot use interceptor
 * @param url - The url to be used for the request
 * @param options - The necessary options for the request such as Body and Method. \
 * Headers and Credentials are already overriden in the function 
 */
const api: ApiService = async (url: string, options: RequestInit = {}) => {
    // --- Retrieves the CSRF Access token from redux or local storage
    let token = store.getState().auth.csrfAccessToken || localStorage.getItem('csrfAccessToken');

    // --- Sets up a headers object with the provided options or creates an empty object
    const headers = new Headers(options.headers || {});

    // --- Sets the headers object with the retrieved token
    if (token) {
        headers.set('X-CSRF-TOKEN', token)
        if (store.getState().auth.csrfAccessToken) {
            DEVELOPER_MODE && console.log(localTime(), `- @API_INTERCEPTOR: Token retrieved from within the App ${token}`)
        } else if (localStorage.getItem('csrfAccessToken')) {
            DEVELOPER_MODE && console.log(localTime(), `- @API_INTERCEPTOR: Token retrieved from the local storage ${token}`)
        }
    }

    // --- Sets Content type key if the body is not media
    if (!(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    // --- Creates an original request options object to be passed to the callers main request
    // --- Spreads the options provided by the caller such as METHOD, BODY. Headers and credentials are overriden
    const originalRequest = {
        ...options,
        headers,
        credentials: 'include' as RequestCredentials
    };

    // --- 1. Makes the main requets for the caller ---
    let response = await fetch(`${API_BASE_URL}${url}`, originalRequest);

    // --- 2. If the fetch main request is unauthorize, Checks if there is a refresh going on within the tab or outside the tab ---
    if (response.status === 401) {
        DEVELOPER_MODE && console.log(localTime(), '- @API_INTERCEPTOR: Just made an auth request for the AUTH THUNK and received an error.', await response.json())

        const isThisTabRefreshing = store.getState().auth.isRefreshing;
        const isAnotherTabRefreshing = !!localStorage.getItem(REFRESH_LOCK_KEY);

        // --- A. If there is a another refresh request within the tab, we queue the current request and promise to resolve it later
        if (isThisTabRefreshing) {
            DEVELOPER_MODE && console.log(localTime(), '- @API_Interceptor: This tab is already refreshing. Queuing request.')
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(newAccessToken => {
                originalRequest.headers.set('X-CSRF-TOKEN', newAccessToken as string);
                return fetch(`${API_BASE_URL}${url}`, originalRequest);
            });
        }

        // --- B. If there is another tab refreshing, we listen for changes within the local storage
        if (isAnotherTabRefreshing) {
            DEVELOPER_MODE && console.log(localTime(), '- @API_Interceptor: Another tab is refreshing. Waiting for lock release...');
            return new Promise((resolve, reject) => {
                const listener = (e: StorageEvent) => {
                    // Success: Another tab finished and set a new token
                    if (e.key === 'csrfAccessToken' && e.newValue) {
                        cleanUp();
                        resolve(e.newValue); // Resolve with the new token
                    }
                    // Failure: another tab failed or released the lock
                    if (e.key === REFRESH_LOCK_KEY && !e.newValue) {
                        cleanUp();
                        const err = { type: 'auth', message: 'Session expired (other tab failed refresh).' }; // Reject to force a full re-auth
                        reject(err);
                    }
                };

                const cleanUp = () => {
                    window.removeEventListener('storage', listener);
                    clearTimeout(waitTimeout);
                };

                // Failsafe: if the lock isn't released, reject
                const waitTimeout = setTimeout(() => {
                    cleanUp();
                    DEVELOPER_MODE && console.log(localTime(), '- @API_Interceptor: Timeout waiting for other tab.');
                    const err = { type: 'auth', message: 'Session expired (timeout waiting for other tab).' };
                    reject(err);
                }, REFRESH_LOCK_TIMEOUT);

                window.addEventListener('storage', listener);

            }).then((newAccessToken) => {
                originalRequest.headers.set('X-CSRF-TOKEN', newAccessToken as string);
                return fetch(`${API_BASE_URL}${url}`, originalRequest);
            });
        }
        // --- C. No one is refreshing. It's our job.
        DEVELOPER_MODE && console.log(localTime(), '- @API_INTERCEPTOR: No refresh in progress. Setting lock and calling REFRESH THUNK')
        localStorage.setItem(REFRESH_LOCK_KEY, 'true'); // SET CROSS-TAB LOCK

        try {
            // i. --- dispatches the refresh token thunk (this sets isRefreshing=true)
            const result = await store.dispatch(refreshToken()).unwrap();
            DEVELOPER_MODE && console.log(localTime(), '- @API_INTERCEPTOR: Just triggered a refresh request with this result', result)

            const newAccessToken = result.csrf_access_token;

            // ii. --- Go back and process pending refresh
            processQueue(null, newAccessToken);

            // ii. --- updates the users original request options object with the new acces token
            originalRequest.headers.set('X-CSRF-TOKEN', newAccessToken);

            // iii. --- Now that we have a new, valid token, force a socket connection.
            connectSocket();

            // iv. --- Reattempts the caller's request with updated values
            DEVELOPER_MODE && console.log(localTime(), '- @API_INTERCEPTOR: Attempting a new auth request for the auth-check Thunk')
            return fetch(`${API_BASE_URL}${url}`, originalRequest);

        } catch (error: any) {
            DEVELOPER_MODE && console.log(localTime(), '- @API_INTERCEPTOR: Just caught this error from my Try Block', error)
            const err = error as RefreshReject;
            
            if (err && err.type === 'auth') {
                // Calls the process queue to reject the promise if the refresh token failed
                // Do not log out if it was a network error
                processQueue(err, null);
                store.dispatch(logoutUser());
                return Promise.reject(err);
            }

            processQueue(err, null);
            return Promise.reject(err);

        } finally {
            // ALWAYS release the lock, whether we succeeded or failed
            localStorage.removeItem(REFRESH_LOCK_KEY);
            DEVELOPER_MODE && console.log(localTime(), '- @API_INTERCEPTOR: Refresh complete. Lock released.')
        }
    }

    return response
}

export default api