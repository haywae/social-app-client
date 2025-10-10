import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Signup from '../../../pages/authPages/register';
import { registerUser } from '../../../thunks/userThunks/registerThunk';
import * as hooks from '../../../utils/hooks';

// ---- Mocks ---- //

// Mock the registerUser thunk module
vi.mock('../../../thunks/userThunks/registerThunk', () => ({
    registerUser: vi.fn(), //dummy thunk
}));

// Mock the countries data module
vi.mock('../../../data/countries', () => ({
    countries: [
        { name: 'Canada', code: 'CA' },
        { name: 'United States', code: 'US' },
    ],
}));

// Mock the react-router-dom navigation hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock the custom Redux hooks module
const mockDispatch = vi.fn();
vi.mock('../../../utils/hooks', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: vi.fn(),
}));

describe('Signup Component', () => {

    beforeEach(() => {
        // Reset all mocks before each test to ensure isolation
        vi.clearAllMocks();
    });

    // A helper to render the component with a specific Redux state
    const renderComponent = (initialState: { loading: boolean; error: string | null }) => {
        const useAppSelectorspy =vi.spyOn(hooks, 'useAppSelector')
        useAppSelectorspy.mockReturnValue(initialState);
        return render(
            <MemoryRouter> {/*Gives the component a simulated routing environment*/}
                <Signup />
            </MemoryRouter>
        );
    };

    // --- Test Cases ---
    // 1. 
    it('should render all form fields correctly', () => {
        renderComponent({ loading: false, error: null });
        expect(screen.getByText(/display name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
        expect(screen.getByText(/Select/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });
        
    // 2.
    it('should show a client-side validation error if required fields are empty', async () => {
        // Arrange
        const { container } = renderComponent({ loading: false, error: null });
        const form = container.querySelector('form');

        // Act: Simulate submitting the form directly
        fireEvent.submit(form!);

        // Assert
        expect(await screen.findByText('All fields are required.')).toBeInTheDocument();
        expect(registerUser).not.toHaveBeenCalled();
    });

    // 3.
    it('should show a client-side validation error if passwords do not match', async () => {
        // Arrange
        const { container } = renderComponent({ loading: false, error: null });
        const form = container.querySelector('form');
        
        // Act
        await userEvent.type(screen.getByLabelText(/username/i), 'testuser2');
        await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
        await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
        await userEvent.type(screen.getByLabelText(/confirm password/i), 'password456');
        
        fireEvent.submit(form!);

        // Assert
        expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
        expect(registerUser).not.toHaveBeenCalled();
    });

    // 4.
    it('should dispatch registerUser and display error message on failed submission', async () => {
        // Arrange
        const serverError = 'Username is already taken';

        // This mocks the dispatch call to simulate a failed API request
        mockDispatch.mockReturnValue({ unwrap: vi.fn().mockRejectedValue(serverError) });
        const { container, rerender } = renderComponent({ loading: false, error: null });
        const form = container.querySelector('form');

        const user = userEvent.setup();

        // Act
        await user.type(screen.getByLabelText(/display name/i), 'Test User');
        await user.type(screen.getByLabelText(/username/i), 'testuser');
        await user.type(screen.getByLabelText(/email/i), 'test@example.com');
        await user.type(screen.getByLabelText(/date of birth/i), '2000-01-01');
        await user.click(screen.getByText(/Select/i));
        await user.click(await screen.findByText('Canada'));
        await user.type(screen.getByLabelText(/^password$/i), 'password123');
        await user.type(screen.getByLabelText(/confirm password/i), 'password123');
        
        fireEvent.submit(form!);

        // Assert
        // First, wait for the async submission logic to trigger the dispatch.
        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledTimes(1);
        });

        // Next, simulate the Redux state updating with the error from the failed API call.
        // This is the "side effect" part, now correctly placed outside of waitFor.
        const mockSelector = hooks.useAppSelector as Mock;
        mockSelector.mockReturnValue({ loading: false, error: serverError });

        rerender(<MemoryRouter><Signup /></MemoryRouter>);

        // Finally, assert that the error message appears in the UI as a result of the state change.
        // `findByText` is the perfect tool here as it waits for the element to appear.
        expect(await screen.findByText(serverError)).toBeInTheDocument();
        
        
    });

    it('should disable the submit button and show loading text when loading', () => {
        renderComponent({ loading: true, error: null });
        const button = screen.getByRole('button', { name: /signing up/i });
        expect(button).toBeDisabled();
        expect(button).toHaveTextContent('Signing Up...');
    });

    it("should dispatch registerUser and navigate on successful submission", async () => {
        mockDispatch.mockReturnValue({
            unwrap: vi.fn().mockResolvedValue({ userId: "123" })
        }) 
        const { container } = renderComponent({ loading: false, error: null });
        const form = container.querySelector('form');

        const user = userEvent.setup();


        // Act
        await user.type(screen.getByLabelText(/display name/i), 'Test User');
        await user.type(screen.getByLabelText(/username/i), 'testuser');
        await user.type(screen.getByLabelText(/email/i), 'test@example.com');
        await user.type(screen.getByLabelText(/date of birth/i), '2000-01-01');
        await user.click(screen.getByText(/Select/i));
        await user.click(await screen.findByText('Canada'));
        await user.type(screen.getByLabelText(/^password$/i), 'password123');
        await user.type(screen.getByLabelText(/confirm password/i), 'password123');
        
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith("/login"); // or whatever route you expect
        });
    });

})