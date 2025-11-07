import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apiInterceptor';

interface FollowUserArgs {
    username: string;
    isFollowing: boolean; 
}

/**
 * An async thunk for following or unfollowing a user.
 * It performs an optimistic update.
 */
export const followUser = createAsyncThunk<
    string,
    FollowUserArgs,
    { rejectValue: string }
>(
    'users/follow',
    async ({ username, isFollowing }, { rejectWithValue }) => {
        try {
            // Determine the HTTP method based on the action
            const method = isFollowing ? 'DELETE' : 'POST';

            const response = await api(`/users/${username}/follow`, {
                method,
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Follow request failed.');
            }

            // On success, return the username to the reducer
            return username;

        } catch (error: any) {
            return rejectWithValue(error.message || 'An unknown network error occurred.');
        }
    }
);