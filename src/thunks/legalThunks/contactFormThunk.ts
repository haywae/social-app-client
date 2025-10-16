import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../appConfig";
import { setSuccess, setError } from "../../slices/ui/uiSlice";

// Define the shape of the data submitted from the form
interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

// Define the shape of a successful response from the API
interface ContactFormSuccess {
    message: string;
}

/**
 * An async thunk to handle the contact form submission.
 * It uses a direct `fetch` call to bypass the API interceptor,
 * as this is a public, unauthenticated endpoint.
 */
export const submitContactForm = createAsyncThunk<
    ContactFormSuccess,      // Type for a successful return
    ContactFormData,         // Type for the arguments passed to the thunk
    { rejectValue: string } // Type for the value returned on failure
>(
    'ui/submitContactForm',
    async (formData, { dispatch, rejectWithValue }) => {
        try {
            // 1. Send the form data to the backend endpoint.
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            // 2. If the server returns an error (e.g., 400 for validation),
            // parse the error message and reject the promise.
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Failed to send message.';
                dispatch(setError(errorMessage)); // Optionally dispatch an error to the UI slice
                return rejectWithValue(errorMessage);
            }

            // 3. If successful, parse the success message and return it.
            const successData: ContactFormSuccess = await response.json();
            dispatch(setSuccess(successData.message)); // Optionally dispatch a success message
            return successData;

        } catch (error: any) {
            // Handle network errors or other unexpected issues.
            const errorMessage = error.message || 'An unknown network error occurred.';
            dispatch(setError(errorMessage));
            return rejectWithValue(errorMessage);
        }
    }
);
