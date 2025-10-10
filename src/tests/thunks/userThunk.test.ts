// src/features/users/userThunks.test.ts
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../server'; 
import { registerUser, type RegisterCredentials } from '../../thunks/userThunks/registerThunk';
import { requestPasswordReset } from '../../thunks/userThunks/requestPasswordResetThunk';
import { resetPassword } from '../../thunks/userThunks/resetPasswordThunk';
import type { User } from '../../slices/auth/authSlice';
import type { ResetPasswordCredentials } from '../../slices/user/passwordResetSlice';
import { API_BASE_URL } from '../../appConfig';

// A mock registration credential
const mockRegisterCredentials: RegisterCredentials = {
  displayName: 'New User',
  username: 'NewUser',
  email: 'new@example.com',
  password: 'password123',
  date_of_birth: '2000-01-01',
  country: 'Nigeria',
};

// A mock user credentials after login
const mockUser: User = { 
    id: '2', 
    username: 'NewUser',
    csrf_access_token: 'csrf_access_token_12345',
    csrf_refresh_token: 'csrf_refresh_token_67890',
    access_token_exp: '2023-10-01T00:00:00Z',
};

const mockEmail = 'test@example.com';
const mockToken = 'valid-reset-token-12345';

const successResponse = { message: 'Password reset link sent to your email.' };
const notFoundError = { message: 'Email address not found.' };
const mockApiError = { message: 'Username or email already exists' };
const invalidTokenError = { message: 'Invalid or expired token.' };

const mockResetPasswordCredentials: ResetPasswordCredentials = {
  token: mockToken,
  newPassword: 'newStrongPassword123!'
};

const userReducer = (state = {}) => state;
const makeStore = () => configureStore({reducer: {user: userReducer}});

describe('registerUser async thunk', () => {
    let store: ReturnType<typeof makeStore>;

    // Start the server before all tests in this file
    beforeAll(() => server.listen());

    // Reset handlers and create a new store after each test
    afterEach(() => {
        server.resetHandlers();
        store = makeStore();
    });

    // Close the server after all tests are done
    afterAll(() => server.close());

    // 1. THE HAPPY PATH: Test for successful registration
    it('should return a fulfilled action and user data on successful registration', async () => {
        // Arrange: Set up a success handler for the register endpoint
        server.use(
            http.post(`${API_BASE_URL}/register`, () => {
                // Typically a successful registration returns a 201 Created status
                return HttpResponse.json(mockUser, { status: 201 });
            })
        );

        store = makeStore();

        // Act: Dispatch the thunk with the mock credentials
        const resultAction = await store.dispatch(registerUser(mockRegisterCredentials));

        // Assert: Check the action type and payload
        expect(resultAction.type).toBe('register/registerUser/fulfilled');
        expect(resultAction.payload).toEqual(mockUser);
    });

    // 2. API ERROR: Test for a failed registration (e.g., 409 Conflict)
    it('should return a rejected action on API error (e.g., user exists)', async () => {
        // Arrange: Override with a handler for a 409 Conflict error
        server.use(
            http.post(`${API_BASE_URL}/register`, () => {
                return HttpResponse.json(mockApiError, { status: 409 });
            })
        );
        store = makeStore();

        // Act
        const resultAction = await store.dispatch(registerUser(mockRegisterCredentials));

        // Assert
        expect(resultAction.type).toBe('register/registerUser/rejected');
        expect(resultAction.payload).toBe(mockApiError.message);
    });

    // 3. NETWORK ERROR: Test for a failure to connect to the server
    it('should return a rejected action on a network error', async () => {
        // Arrange: Force a network error for this specific test
        server.use(
            http.post(`${API_BASE_URL}/register`, () => {
                return HttpResponse.error();
            })
        );
        store = makeStore();

        // Act
        const resultAction = await store.dispatch(registerUser(mockRegisterCredentials));

        // Assert
        expect(resultAction.type).toBe('register/registerUser/rejected');
        // A network error's payload will be a string. We don't need to check the exact message.
        expect(typeof resultAction.payload).toBe('string');
    });
});

describe('requestPasswordReset async thunk', () => {
    let store: ReturnType<typeof makeStore>;

    // Manage MSW server lifecycle
    beforeAll(() => server.listen());
    afterEach(() => {
        server.resetHandlers();
        store = makeStore();
    });
    afterAll(() => server.close());

    // 1. THE HAPPY PATH: Test for a successful password reset request
    it('should return a fulfilled action on a successful request', async () => {
        // Arrange: Set up a success handler for the endpoint
        server.use(
            http.post(`${API_BASE_URL}/request-password-reset`, () => {
                return HttpResponse.json(successResponse, { status: 200 });
            })
        );
        store = makeStore();

        // Act: Dispatch the thunk with the mock email
        const resultAction = await store.dispatch(requestPasswordReset(mockEmail));

        // Assert: Check for the fulfilled action and correct payload
        expect(resultAction.type).toBe('passwordReset/requestPasswordReset/fulfilled');
        expect(resultAction.payload).toEqual(successResponse);
    });

    // 2. API ERROR: Test for a failed request (e.g., email not found)
    it('should return a rejected action if the email is not found (404)', async () => {
        // Arrange: Set up a handler for a 404 Not Found error
        server.use(
            http.post(`${API_BASE_URL}/request-password-reset`, () => {
                return HttpResponse.json(notFoundError, { status: 404 });
            })
        );
        store = makeStore();

        // Act
        const resultAction = await store.dispatch(requestPasswordReset(mockEmail));

        // Assert
        expect(resultAction.type).toBe('passwordReset/requestPasswordReset/rejected');
        expect(resultAction.payload).toBe(notFoundError.message);
    });

    // 3. NETWORK ERROR: Test for a failure to connect to the server
    it('should return a rejected action on a network error', async () => {
        // Arrange: Force a network error for this specific test
        server.use(
            http.post(`${API_BASE_URL}/request-password-reset`, () => {
                return HttpResponse.error();
            })
        );
        store = makeStore();

        // Act
        const resultAction = await store.dispatch(requestPasswordReset(mockEmail));

        // Assert
        expect(resultAction.type).toBe('passwordReset/requestPasswordReset/rejected');
        // On a network error, the payload should be a string.
        expect(typeof resultAction.payload).toBe('string');
    });
});

describe('resetPassword async thunk', () => {
    let store: ReturnType<typeof makeStore>;

    // Manage MSW server lifecycle
    beforeAll(() => server.listen());
    afterEach(() => {
        server.resetHandlers();
        store = makeStore();
    });
    afterAll(() => server.close());

    // 1. THE HAPPY PATH: Test for a successful password reset
    it('should return a fulfilled action on a successful password reset', async () => {
        // Arrange: Set up a success handler for the endpoint
        server.use(
            http.post(`${API_BASE_URL}/reset-password/${mockToken}`, () => {
                return HttpResponse.json(successResponse, { status: 200 });
            })
        );
        store = makeStore();

        // Act: Dispatch the thunk with the mock credentials
        const resultAction = await store.dispatch(resetPassword(mockResetPasswordCredentials));

        // Assert: Check for the fulfilled action and correct payload
        expect(resultAction.type).toBe('passwordReset/resetPassword/fulfilled');
        expect(resultAction.payload).toEqual(successResponse);
    });

    // 2. API ERROR: Test for a failed reset (e.g., invalid token)
    it('should return a rejected action if the reset token is invalid (400)', async () => {
        // Arrange: Set up a handler for a 400 Bad Request error
        server.use(
            http.post(`${API_BASE_URL}/reset-password/${mockToken}`, () => {
                return HttpResponse.json(invalidTokenError, { status: 400 });
            })
        );
        store = makeStore();

        // Act
        const resultAction = await store.dispatch(resetPassword(mockResetPasswordCredentials));

        // Assert
        expect(resultAction.type).toBe('passwordReset/resetPassword/rejected');
        expect(resultAction.payload).toBe(invalidTokenError.message);
    });

    // 3. NETWORK ERROR: Test for a failure to connect to the server
    it('should return a rejected action on a network error', async () => {
        // Arrange: Force a network error for this specific test
        server.use(
            http.post(`${API_BASE_URL}/reset_password/${mockToken}`, () => {
                return HttpResponse.error();
            })
        );
        store = makeStore();

        // Act
        const resultAction = await store.dispatch(resetPassword(mockResetPasswordCredentials));

        // Assert
        expect(resultAction.type).toBe('passwordReset/resetPassword/rejected');
        // On a network error, the payload should be a string.
        expect(typeof resultAction.payload).toBe('string');
    });
});
