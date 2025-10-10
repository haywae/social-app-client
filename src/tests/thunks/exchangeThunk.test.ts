import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { fetchExchangeData } from '../../thunks/exchangeThunks/fetchExchangeDataThunk';
import { updateExchangeRates } from '../../thunks/exchangeThunks/updateExchangeRatesThunk';
import { type ExchangeData } from '../../slices/exchange/exchangeSlice';
import type { Rate } from "../../components/exchange/converter";


// Helper to create a mock Response object for fetch
const createMockResponse = (body: any, ok: boolean, status: number) => {
    Boolean(ok); // Ensure ok is a boolean just to shut typescript up
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
};

describe('fetchExchangeData Thunk', () => {
    // --- Mocks & Test Data ---
    const mockDispatch = vi.fn();
    const mockGetState = vi.fn();

    const mockExchangeData: ExchangeData = {
        name: 'Global Currency Hub',
        country: 'USA',
        base_currency: 'USD',
        rates: [{ currency: 'EUR', buy: 0.92, sell: 0.95 }],
        last_updated: new Date().toISOString(),
    };

    const mockApiResponse = {
        message: 'Exchange data retrieved successfully.',
        exchange: mockExchangeData,
    };

    beforeEach(() => {
        // Mock window.fetch for the JSDOM environment
        vi.spyOn(window, 'fetch');
        // Mock localStorage
        vi.spyOn(Storage.prototype, 'getItem');
    });

    afterEach(() => {
        vi.restoreAllMocks();
        mockDispatch.mockClear();
        mockGetState.mockClear();
    });

    // --- Tests ---
    it('should dispatch fulfilled action on successful fetch', async () => {
        // Arrange
        (localStorage.getItem as Mock).mockReturnValue('fake-csrf-token');
        (window.fetch as Mock).mockResolvedValue(createMockResponse(mockApiResponse, true, 200));

        // Act
        const thunk = fetchExchangeData();
        await thunk(mockDispatch, mockGetState, undefined);

        // Assert
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: fetchExchangeData.pending.type }));
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ 
            type: fetchExchangeData.fulfilled.type,
            payload: mockExchangeData 
        }));
        expect(window.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            headers: { 'X-CSRF-TOKEN': 'fake-csrf-token', 'Content-Type': 'application/json' },
        }));
    });

    it('should dispatch rejected action if CSRF token is missing', async () => {
        // Arrange
        (localStorage.getItem as Mock).mockReturnValue(null);

        // Act
        const thunk = fetchExchangeData();
        await thunk(mockDispatch, mockGetState, undefined);

        // Assert
        expect(window.fetch).not.toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: fetchExchangeData.pending.type }));
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: fetchExchangeData.rejected.type,
            payload: 'CSRF token not found. User may not be authenticated.'
        }));
    });

    it('should dispatch rejected action for a 404 "Not Found" response', async () => {
        // Arrange
        (localStorage.getItem as Mock).mockReturnValue('fake-csrf-token');
        (window.fetch as Mock).mockResolvedValue(createMockResponse({ message: 'Not found' }, false, 404));

        // Act
        const thunk = fetchExchangeData();
        await thunk(mockDispatch, mockGetState, undefined);

        // Assert
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: fetchExchangeData.pending.type }));
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: fetchExchangeData.rejected.type,
            payload: 'No exchange found for this user.'
        }));
    });

    it('should dispatch rejected action for a generic server error (e.g., 500)', async () => {
        // Arrange
        const errorResponse = { message: 'Internal Server Error' };
        (localStorage.getItem as Mock).mockReturnValue('fake-csrf-token');
        (window.fetch as Mock).mockResolvedValue(createMockResponse(errorResponse, false, 500));

        // Act
        const thunk = fetchExchangeData();
        await thunk(mockDispatch, mockGetState, undefined);

        // Assert
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: fetchExchangeData.pending.type }));
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: fetchExchangeData.rejected.type,
            payload: errorResponse.message
        }));
    });

    it('should dispatch rejected action on a network error', async () => {
        // Arrange
        const networkError = new Error('Network request failed');
        (localStorage.getItem as Mock).mockReturnValue('fake-csrf-token');
        (window.fetch as Mock).mockRejectedValue(networkError);

        // Act
        const thunk = fetchExchangeData();
        await thunk(mockDispatch, mockGetState, undefined);

        // Assert
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: fetchExchangeData.pending.type }));
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: fetchExchangeData.rejected.type,
            payload: networkError.message
        }));
    });
});




describe('updateExchangeRates Thunk', () => {
    const mockDispatch = vi.fn();
    const mockGetState = vi.fn();

    const mockRatesToUpdate: Rate[] = [
        { currency: 'EUR', buy: 0.93, sell: 0.96 },
        { currency: 'GBP', buy: 0.78, sell: 0.81 },
    ];

    const mockUpdatedExchangeData: ExchangeData = {
        name: 'Global Currency Hub',
        country: 'USA',
        base_currency: 'USD',
        rates: mockRatesToUpdate,
        last_updated: new Date().toISOString(),
    };

    const mockUpdateApiResponse = {
        message: 'Exchange rates updated successfully.',
        exchange: mockUpdatedExchangeData,
    };

    beforeEach(() => {
        vi.spyOn(window, 'fetch');
        vi.spyOn(Storage.prototype, 'getItem');
    });

    afterEach(() => {
        vi.restoreAllMocks();
        mockDispatch.mockClear();
        mockGetState.mockClear();
    });

    it('should dispatch fulfilled action on successful update', async () => {
        // Arrange
        (localStorage.getItem as Mock).mockReturnValue('fake-csrf-token');
        (window.fetch as Mock).mockResolvedValue(createMockResponse(mockUpdateApiResponse, true, 200));

        // Act
        const thunk = updateExchangeRates({ rates: mockRatesToUpdate });
        await thunk(mockDispatch, mockGetState, undefined);

        // Assert
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: updateExchangeRates.pending.type }));
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: updateExchangeRates.fulfilled.type,
            payload: mockUpdatedExchangeData,
        }));
        expect(window.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ rates: mockRatesToUpdate }),
            headers: { 'X-CSRF-TOKEN': 'fake-csrf-token', 'Content-Type': 'application/json' },
        }));
    });

    it('should dispatch rejected action if CSRF token is missing', async () => {
        // Arrange
        (localStorage.getItem as Mock).mockReturnValue(null);

        // Act
        const thunk = updateExchangeRates({ rates: mockRatesToUpdate });
        await thunk(mockDispatch, mockGetState, undefined);

        // Assert
        expect(window.fetch).not.toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: updateExchangeRates.pending.type }));
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: updateExchangeRates.rejected.type,
            payload: 'CSRF token not found. User may not be authenticated.',
        }));
    });

    it('should dispatch rejected action for a generic server error', async () => {
        // Arrange
        const errorResponse = { message: 'Update failed due to server error' };
        (localStorage.getItem as Mock).mockReturnValue('fake-csrf-token');
        (window.fetch as Mock).mockResolvedValue(createMockResponse(errorResponse, false, 500));

        // Act
        const thunk = updateExchangeRates({ rates: mockRatesToUpdate });
        await thunk(mockDispatch, mockGetState, undefined);

        // Assert
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: updateExchangeRates.pending.type }));
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: updateExchangeRates.rejected.type,
            payload: errorResponse.message,
        }));
    });

    it('should dispatch rejected action on a network error', async () => {
        // Arrange
        const networkError = new Error('Network connection lost');
        (localStorage.getItem as Mock).mockReturnValue('fake-csrf-token');
        (window.fetch as Mock).mockRejectedValue(networkError);

        // Act
        const thunk = updateExchangeRates({ rates: mockRatesToUpdate });
        await thunk(mockDispatch, mockGetState, undefined);

        // Assert
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: updateExchangeRates.pending.type }));
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: updateExchangeRates.rejected.type,
            payload: networkError.message,
        }));
    });
});

