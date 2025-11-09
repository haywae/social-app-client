import store from './store';
import { refreshToken, type RefreshReject } from './thunks/authThunks/refreshTokenThunk';
import { logoutUser } from './thunks/authThunks/logoutThunk';
import { API_BASE_URL, DEVELOPER_MODE } from './appConfig';
import { connectSocket } from './services/socketService';

// The shape of the 'defaults' property
interface ApiDefaults {
    headers: {
        'X-CSRF-TOKEN': string | null;
    };
}

// The complete shape of the 'api' object: a callable function AND an object with properties
type ApiService = {
    (url: string, options?: RequestInit): Promise<Response>; // It's a function
    defaults: ApiDefaults; // It also has a 'defaults' property
};


let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void,
    reject: (reason?: any) => void
}> = [];

// A function that resolves or rejects a promise and reset the queue if its has items
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


/**
 * An API Interceptor that refreshes the refresh tokens if the original request failed due authentication(401 Error) \
 *  To avoid infinte loops, thunks used by the Api Interceptor cannot use interceptor
 * @param url - The url to be used for the request
 * @param options - The necessary options for the request such as Body and Method. \
 * Headers and Credentials are already overriden in the function 
 */
const api: ApiService = async (url: string, options: RequestInit = {}) => {
    // Retrieves the CSRF Access token from local storage
    let token = localStorage.getItem('csrfAccessToken')

    // Sets up a headers object with the provided options or creates an empty object
    const headers = new Headers(options.headers || {});

    // Updates the headers object with the retrieved token
    if (token) {
        headers.set('X-CSRF-TOKEN', token)
    }

    // Updates the headers object with the Content type key if its not a medis
    if (!(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    // Creates an original request options object to be passed to the callers main request
    // Spreads the options provided by the caller such as METHOD, BODY. Headers and credentials are overriden
    const originalRequest = {
        ...options,
        headers,
        credentials: 'include' as RequestCredentials
    };

    // --- 1. Makes the main requets for the caller ---
    let response = await fetch(`${API_BASE_URL}${url}`, originalRequest);

    // --- 2. If the fetch main request is unauthorized, it attempts to refresh the token ---
    if (response.status === 401) {
        // Ensures only the first API call that triggers a 401, triggers a token refresh
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                // a. --- dispatches the refresh token thunk and gets the new access token
                const result = await store.dispatch(refreshToken()).unwrap();
                const newAccessToken = result.csrf_access_token;

                // b. --- adds the new CSRF Token to the api object's default.headers 
                // Calls the process queue function to resolve the pending promise on the queue with the new csrf token
                api.defaults.headers['X-CSRF-TOKEN'] = newAccessToken;
                processQueue(null, newAccessToken);

                // c. --- updates the users original request options object with the new acces token
                originalRequest.headers.set('X-CSRF-TOKEN', newAccessToken);

                // d. --- Now that we have a new, valid token, force a socket connection.
                connectSocket();

                // e. --- Reattempts the caller's request with updated values
                return fetch(`${API_BASE_URL}${url}`, originalRequest);

            } catch (error: any) {
                DEVELOPER_MODE && console.log('This is the error received by the API INTERCEPTOR')
                const err = error as RefreshReject;
                if (err && err.type === 'network') {
                    // Calls the process queue to reject the promise if the refresh token failed
                    // Do not log out if it was a network error
                    processQueue(err, null);
                    return Promise.reject(err);
                }

                processQueue(err, null);
                store.dispatch(logoutUser());
                return Promise.reject(err);

            } finally {
                isRefreshing = false;
            }
        }
        // If there is another request caught by the interceptor while one is being executed, 
        // it creates a promise object and resolve or reject callback functions
        // calling the callback functions allows the then block to execute
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        }).then(newAccessToken => {
            originalRequest.headers.set('X-CSRF-TOKEN', newAccessToken as string);
            return fetch(`${API_BASE_URL}${url}`, originalRequest);
        });
    }

    return response
}
// Creates a defaults property for the API object
api.defaults = {
    headers: {
        'X-CSRF-TOKEN': null
    }
};

export default api