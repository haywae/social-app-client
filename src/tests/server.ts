import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { User } from '../configs/userTypes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Define the happy path response
const mockUser: User = {
  id: '1',
  username: 'TestUser',
  csrf_access_token: 'csrf_access_token_value',
  csrf_refresh_token: 'csrf_refresh_token_value',
  access_token_exp: '2023-10-01T00:00:00Z',
};

// Define handlers for your API endpoints
export const handlers = [
  // Handler for successful login
  http.post(`${API_BASE_URL}/login`, () => {
    return HttpResponse.json(mockUser, {status: 200});
  }),

  http.post(`${API_BASE_URL}/register`, () => {
    // Return the mock data your app expects on successful registration
    return HttpResponse.json(mockUser, { status: 201 });
  }),

  http.post(`${API_BASE_URL}/logout`, () => {
    return new HttpResponse(null, { status: 200 });
  }),
  
  http.post(`${API_BASE_URL}/refresh-token`, () => {
    return HttpResponse.json({ message: 'Token Refreshed Successfully' }, { status: 200 });
  }),

  http.post(`${API_BASE_URL}/request-password-reset`, () => {
    return HttpResponse.json({ message: 'Password reset email sent' }, { status: 200 });
  
  }),
  http.post(`${API_BASE_URL}/reset-password`, () => {
    return HttpResponse.json({ message: 'Password reset successful' }, { status: 200 });
  }),
];

// Create the mock server
export const server = setupServer(...handlers);