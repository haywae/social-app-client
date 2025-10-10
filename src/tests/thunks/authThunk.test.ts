import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, beforeEach, beforeAll, afterEach, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../server'; 
import { loginUser, type LoginCredentials} from '../../thunks/authThunks/loginThunk';
import { logoutUser } from '../../thunks/authThunks/logoutThunk';
import { refreshToken } from '../../thunks/authThunks/refreshTokenThunk';
import type { RefreshTokenSuccess} from '../../slices/auth/authSlice'
import type { User } from '../../slices/auth/authSlice';
import { checkAuth } from '../../thunks/authThunks/authCheckThunk';
import { API_BASE_URL } from '../../appConfig';
import {type AppDispatch } from '../../store';

// Test data
const mockLoginCredentials:LoginCredentials = { loginIdentifier: 'TestUser', password: 'password123' };
const mockUser: User = { id: '1', username: 'TestUser', csrf_access_token: 'csrf_access_token_value', 
    csrf_refresh_token: 'csrf_refresh_token_value', access_token_exp: '2023-10-01T00:00:00Z', 
};

const MOCK_REFRESH_TOKEN = 'test-csrf-refresh-token-67890';
const MOCK_NEW_ACCESS_TOKEN = 'new-access-token-abcde';

const successRefreshResponse: RefreshTokenSuccess = {
  message: "Token Refreshed Successfully",
  csrf_access_token: MOCK_NEW_ACCESS_TOKEN,
  csrf_refresh_token: MOCK_REFRESH_TOKEN,
  access_token_exp: 'new-expiration-time'
};

const unauthorizedError = { message: 'Refresh token is invalid or has expired.' };
const MOCK_ACCESS_TOKEN = 'valid-access-token-123';
const MOCK_CSRF_TOKEN = 'test-csrf-token-12345';

const userReducer = (state = {}) => state;
const makeStore = () => configureStore({reducer: {user: userReducer}});

describe('loginUser async thunk', () => {
  let store: ReturnType<typeof makeStore> & { dispatch: AppDispatch };

  beforeEach(() => {
    store = makeStore()
  })

  const unauthorizedError = {message: 'Invalid Credentials'};
  
  // 1. THE HAPPY PATH: Test for successful login
  it('should dispatch fulfilled action when login is successful', async () => {

    // Act: Call the thunk function
    const resultAction = await store.dispatch(loginUser(mockLoginCredentials))

    // Assert: Check the action type and payload
    expect(resultAction.type).toBe('auth/loginUser/fulfilled');
    expect(resultAction.payload).toEqual(mockUser);
  });

  // 2. API ERROR: Test for a failed login (e.g., 401 Unauthorized)
  it('should return a rejected action when login fails with an API error', async () => {
    // Arrange: Override the default handler for this specific test
    server.use(
      http.post(`${API_BASE_URL}/login`, () => {
        return HttpResponse.json(unauthorizedError, { status: 401 });
      })
    );
    // Act
    const resultAction = await store.dispatch(loginUser(mockLoginCredentials));

    // Assert
    expect(resultAction.type).toBe('auth/loginUser/rejected');
    expect(resultAction.payload).toBe(unauthorizedError.message);
  });

  // 3. NETWORK ERROR: Test for a failure to connect to the server
  it('should dispatch rejected action on a network error', async () => {
    // Arrange: Force a network error for this test
    server.use(
      http.post(`${API_BASE_URL}/login`, () => {
        return HttpResponse.error();
      })
    );
    // Act
    const resultAction = await store.dispatch(loginUser(mockLoginCredentials));

    // Assert
    expect(resultAction.type).toBe('auth/loginUser/rejected');
    // Check for the custom error message from the thunk's catch block
    expect(typeof resultAction.payload).toBe('string');
  });
});


describe('logoutUser async thunk', () => {
    let store: ReturnType<typeof makeStore>;

    // Start the server before all tests in this file
    beforeAll(() => server.listen());

    // After each test, reset MSW handlers and clear localStorage
    afterEach(() => {
        server.resetHandlers();
        localStorage.clear();
        store = makeStore();
    });

    // Close the server after all tests are done
    afterAll(() => server.close());

    // 1. THE HAPPY PATH: Test for successful logout
    it('should return a fulfilled action and clear localStorage on success', async () => {
        // Arrange: Mock the presence of the CSRF token and set up a success handler
        localStorage.setItem('csrfAccessToken', MOCK_CSRF_TOKEN);
        server.use(
            http.post(`${API_BASE_URL}/logout`, () => {
                // A successful logout typically returns a 200 OK with no content
                return new HttpResponse(null, { status: 200 });
            })
        );
        store = makeStore();

        // Act: Dispatch the thunk
        const resultAction = await store.dispatch(logoutUser());

        // Assert: Check the action type and ensure localStorage was cleared
        expect(resultAction.type).toBe('auth/logoutUser/fulfilled');
        expect(localStorage.getItem('csrfAccessToken')).toBeNull();
    });

    // 2. API ERROR: Test for a failed logout (e.g., 401 Unauthorized)
    it('should return a rejected action and not clear localStorage on API error', async () => {
        // Arrange: Mock the token and an API error response
        const mockApiError = { message: 'Invalid or expired token' };
        localStorage.setItem('csrfAccessToken', MOCK_CSRF_TOKEN);
        server.use(
            http.post(`${API_BASE_URL}/logout`, () => {
                return HttpResponse.json(mockApiError, { status: 401 });
            })
        );
        store = makeStore();

        // Act
        const resultAction = await store.dispatch(logoutUser());

        // Assert
        expect(resultAction.type).toBe('auth/logoutUser/rejected');
        expect(resultAction.payload).toBe(mockApiError.message);
        // Crucially, ensure the token was NOT removed on failure
        expect(localStorage.getItem('csrfAccessToken')).toBe(MOCK_CSRF_TOKEN);
    });

    // 3. NO TOKEN: Test for when the user is already logged out
    it('should return a rejected action if no CSRF token is found', async () => {
        // Arrange: Ensure no token exists in localStorage
        store = makeStore();

        // Act
        const resultAction = await store.dispatch(logoutUser());

        // Assert
        expect(resultAction.type).toBe('auth/logoutUser/rejected');
        expect(resultAction.payload).toBe('No CSRF token found. User is not logged in.');
    });
     
    // 4. NETWORK ERROR: Test for a failure to connect to the server
    it('should return a rejected action on a network error', async () => {
        // Arrange: Mock the token and a network failure
        localStorage.setItem('csrfAccessToken', MOCK_CSRF_TOKEN);
        server.use(
            http.post(`${API_BASE_URL}/logout`, () => {
                return HttpResponse.error();
            })
        );
        store = makeStore();
        
        // Act
        const resultAction = await store.dispatch(logoutUser());

        // Assert
        expect(resultAction.type).toBe('auth/logoutUser/rejected');
        expect(typeof resultAction.payload).toBe('string');
    });
});


describe('refreshToken async thunk', () => {
    let store: ReturnType<typeof makeStore>;

    // Manage MSW server lifecycle and clear localStorage for test isolation
    beforeAll(() => server.listen());
    afterEach(() => {
        server.resetHandlers();
        localStorage.clear();
        store = makeStore();
    });
    afterAll(() => server.close());

    // 1. THE HAPPY PATH: Test for a successful token refresh
    it('should return a fulfilled action and update localStorage on success', async () => {
        // Arrange: Mock the refresh token in localStorage and set up a success handler
        localStorage.setItem('csrfRefreshToken', MOCK_REFRESH_TOKEN);
        server.use(
            http.post(`${API_BASE_URL}/refresh-token`, () => {
                return HttpResponse.json(successRefreshResponse, { status: 200 });
            })
        );
        store = makeStore();

        // Act
        const resultAction = await store.dispatch(refreshToken());

        // Assert
        expect(resultAction.type).toBe('auth/refreshToken/fulfilled');
        expect(resultAction.payload).toEqual(successRefreshResponse);
        // Verify that localStorage was updated with the new access token
        expect(localStorage.getItem('csrfAccessToken')).toBe(MOCK_NEW_ACCESS_TOKEN);
        expect(localStorage.getItem('accessTokenExp')).toBe('new-expiration-time');
    });

    // 2. API ERROR: Test for an invalid refresh token
    it('should return a rejected action if the refresh token is invalid (401)', async () => {
        // Arrange: Mock the refresh token and an API error response
        localStorage.setItem('csrfRefreshToken', MOCK_REFRESH_TOKEN);
        server.use(
            http.post(`${API_BASE_URL}/refresh-token`, () => {
                return HttpResponse.json(unauthorizedError, { status: 401 });
            })
        );
        store = makeStore();

        // Act
        const resultAction = await store.dispatch(refreshToken());

        // Assert
        expect(resultAction.type).toBe('auth/refreshToken/rejected');
        expect(resultAction.payload).toBe('Failed to refresh token (Status: 401)');
    });

    // 3. NO TOKEN: Test for when the refresh token is missing locally
    it('should return a rejected action immediately if no refresh token is in localStorage', async () => {
        // Arrange: Ensure localStorage is empty
        store = makeStore();

        // Act
        const resultAction = await store.dispatch(refreshToken());

        // Assert
        expect(resultAction.type).toBe('auth/refreshToken/rejected');
        expect(resultAction.payload).toBe('Refresh token is missing. Please log in again.');
    });

    // 4. NETWORK ERROR: Test for a failure to connect to the server
    it('should return a rejected action on a network error', async () => {
        // Arrange: Mock the refresh token and a network failure
        localStorage.setItem('csrfRefreshToken', MOCK_REFRESH_TOKEN);
        server.use(
            http.post(`${API_BASE_URL}/refresh-token`, () => {
                return HttpResponse.error();
            })
        );
        store = makeStore();

        // Act
        const resultAction = await store.dispatch(refreshToken());

        // Assert
        expect(resultAction.type).toBe('auth/refreshToken/rejected');
        expect(typeof resultAction.payload).toBe('string');
    });
});


describe('checkAuth async thunk', () => {
    let store: ReturnType<typeof makeStore> & { dispatch: AppDispatch };

    // Manage MSW server lifecycle and clear localStorage for test isolation
    beforeAll(() => server.listen());
    afterEach(() => {
        server.resetHandlers();
        localStorage.clear();
        store = makeStore();
    });
    afterAll(() => server.close());

    // 1. THE HAPPY PATH: Test for a successful authentication check
    it('should return a fulfilled action with user data on success', async () => {
        // Arrange: Mock the access token and set up a success handler
        localStorage.setItem('csrfAccessToken', MOCK_ACCESS_TOKEN);
        server.use(
            http.get(`${API_BASE_URL}/auth-check`, () => {
                return HttpResponse.json(mockUser, { status: 200 });
            })
        );
        store = makeStore();

        // Act
        const resultAction = await store.dispatch(checkAuth());

        // Assert
        expect(resultAction.type).toBe('auth/checkAuth/fulfilled');
        expect(resultAction.payload).toEqual(mockUser);
    });

    // 2. API ERROR: Test for an invalid or expired token
    it('should return a rejected action if the token is invalid (401)', async () => {
        // Arrange: Mock the access token and an API error response
        localStorage.setItem('csrfAccessToken', MOCK_ACCESS_TOKEN);
        server.use(
            http.get(`${API_BASE_URL}/auth-check`, () => {
                return HttpResponse.json(unauthorizedError, { status: 401 });
            })
        );
        store = makeStore();

        // Act
        const resultAction = await store.dispatch(checkAuth());

        // Assert
        expect(resultAction.type).toBe('auth/checkAuth/rejected');
        expect(resultAction.payload).toBe('Authentication check failed (Status: 401)');
    });

    // 3. NO TOKEN: Test for when the access token is missing locally
    it('should return a rejected action immediately if no access token is in localStorage', async () => {
        // Arrange: Ensure localStorage is empty
        store = makeStore();

        // Act
        const resultAction = await store.dispatch(checkAuth());

        // Assert
        expect(resultAction.type).toBe('auth/checkAuth/rejected');
        expect(resultAction.payload).toBe('Access token not found. User is not authenticated.');
    });

    // 4. NETWORK ERROR: Test for a failure to connect to the server
    it('should return a rejected action on a network error', async () => {
        // Arrange: Mock the access token and a network failure
        localStorage.setItem('csrfAccessToken', MOCK_ACCESS_TOKEN);
        server.use(
            http.get(`${API_BASE_URL}/auth-check`, () => {
                return HttpResponse.error();
            })
        );
        store = makeStore();

        // Act
        const resultAction = await store.dispatch(checkAuth());

        // Assert
        expect(resultAction.type).toBe('auth/checkAuth/rejected');
        expect(typeof resultAction.payload).toBe('string');
    });
});