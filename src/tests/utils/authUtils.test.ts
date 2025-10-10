/**
 * @file Test suite for the authentication utility functions using Vitest.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi} from 'vitest';
import { clearLocalStorage, scheduleProactiveRefresh } from '../../utils/authUtils'; // Adjust the import path to your utils file
import { refreshToken } from '../../thunks/authThunks/refreshTokenThunk'; // Adjust the import path
import type { AppDispatch } from '../../store'; // Adjust the import path
import { _ } from 'vitest/dist/chunks/reporters.d.BFLkQcL6.js';

// ---- Mocks ---- //

// Mock the refreshToken thunk from an external module.
// This prevents the actual thunk logic from running during tests.
vi.mock('../../thunks/authThunks/refreshTokenThunk', () => ({
  refreshToken: vi.fn(() => ({ type: 'auth/refreshToken/fulfilled' })),
}));


// Create a mock dispatch function to simulate Redux dispatch.
// We can inspect this mock to see if it was called correctly.
const mockDispatch = vi.fn();


// ---- Test Suites ---- //

describe('clearLocalStorage', () => {
    beforeEach(() => {
        // Spy on the Storage prototype to mock localStorage for this suite
        vi.spyOn(Storage.prototype, 'setItem');
        vi.spyOn(Storage.prototype, 'removeItem');

        // Populate mock localStorage with exact keys used by the function
        localStorage.setItem('accessTokenExp', '12345');
        localStorage.setItem('refreshTokenExp', '67890');
        localStorage.setItem('csrfAccessToken', 'abc-token');
        localStorage.setItem('csrfRefreshToken', 'def-token');
        localStorage.setItem('userPreferences', '{"theme":"dark"}');
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should call removeItem for auth-related keys but not for others', () => {
        // Act: Run the function
        clearLocalStorage();

        // Assert: Verify which keys were removed
        expect(localStorage.removeItem).toHaveBeenCalledWith('accessTokenExp');
        expect(localStorage.removeItem).toHaveBeenCalledWith('csrfAccessToken');
        expect(localStorage.removeItem).toHaveBeenCalledWith('csrfRefreshToken');
        
        // Assert: Verify that unrelated keys were NOT removed
        expect(localStorage.removeItem).not.toHaveBeenCalledWith('userPreferences');
    });
});

describe('scheduleProactiveRefresh', () => {
    const MOCK_CURRENT_TIME_MS = 1672531200000; // 2023-01-01 00:00:00 UTC
    
    // Setup fake timers and date mocks
    beforeAll(() => {
        vi.useFakeTimers();
    });

    beforeEach(() => {
        vi.setSystemTime(MOCK_CURRENT_TIME_MS);
        vi.spyOn(localStorage, 'setItem').mockImplementation(() => {});
        vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {});
        vi.spyOn(localStorage, 'getItem').mockImplementation(() => null);
        mockDispatch.mockClear();
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.clearAllTimers();
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    // Test cases for when the function should NOT schedule a refresh
    it.each([
        { case: 'null', value: null },
        { case: 'undefined', value: undefined },
        { case: 'an invalid string', value: 'not-a-valid-timestamp' },
        { case: 'already expired', value: Math.floor((MOCK_CURRENT_TIME_MS - 60000) / 1000).toString() },
        { case: 'expiring in less than 1 minute', value: Math.floor((MOCK_CURRENT_TIME_MS + 59000) / 1000).toString() },
    ])('should NOT schedule a refresh if expiration is $case', ({ value }) => {
        scheduleProactiveRefresh(mockDispatch as AppDispatch, value);
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    // Test case for successful scheduling
    it('schedules a refresh correctly if token expires in more than 1 minute', () => {
        // Arrange: Token expires in 15 minutes
        const futureExpiryMs = MOCK_CURRENT_TIME_MS + 15 * 60 * 1000;
        const futureExpirySec = Math.floor(futureExpiryMs / 1000).toString();
        
        // Act
        scheduleProactiveRefresh(mockDispatch as AppDispatch, futureExpirySec);
        
        // Assert: Should not have been called yet
        expect(mockDispatch).not.toHaveBeenCalled();
        
        // Calculation: 15 min expiry - 1 min safety margin = 14 min delay
        const expectedDelayMs = 14 * 60 * 1000;
        
        // Advance time to just before the refresh is due
        vi.advanceTimersByTime(expectedDelayMs - 1);
        expect(mockDispatch).not.toHaveBeenCalled();
        
        // Advance time by 1ms to trigger the timeout
        vi.advanceTimersByTime(1);
        expect(mockDispatch).toHaveBeenCalledWith(refreshToken());
    });

    it('stores and clears timeout ID in localStorage during a successful schedule', () => {
        // Arrange: Token expires in 10 minutes
        const expiryMs = MOCK_CURRENT_TIME_MS + 10 * 60 * 1000;
        const expirySec = Math.floor(expiryMs / 1000).toString();

        // Act
        scheduleProactiveRefresh(mockDispatch as AppDispatch, expirySec);

        // Assert: Should have stored the timeout ID
        expect(localStorage.setItem).toHaveBeenCalledWith(
            'refreshTokenTimeoutId',
            expect.any(String) // The exact ID is unpredictable, so we check for type
        );
        
        // Calculation: 10 min expiry - 1 min safety margin = 9 min delay
        const timeToRefreshMs = 9 * 60 * 1000;

        // Act: Advance timers to trigger the refresh
        vi.advanceTimersByTime(timeToRefreshMs);

        // Assert: The timeout callback should have removed the ID
        expect(localStorage.removeItem).toHaveBeenCalledWith('refreshTokenTimeoutId');
        expect(mockDispatch).toHaveBeenCalledWith(refreshToken());
    });
});