import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { fetchUserProfile } from "../../thunks/userThunks/fetchUserProfile";
import { followUser } from "../../thunks/userThunks/followUserThunk";
import { fetchUserExchangeData } from "../../thunks/exchangeThunks/fetchUserExchangeDataThunk";
import type { UserProfileData } from "../../types/userProfileType";
import type { ExchangeData } from "../../types/exchange";

// Define the shape of the data for a user's profile

/**
 * Defines the shape of the state for managing a user's profile.
 */
interface ProfileState {
    profile: UserProfileData | null;
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error: string | null;
    exchangeData: ExchangeData | null;
    exchangeLoading: 'idle' | 'pending' | 'succeeded' | 'failed';
    exchangeError: string | null;
}

/**
 * The initial state for the profile slice.
 */
const initialState: ProfileState = {
    profile: null,
    loading: 'idle',
    error: null,
    exchangeData: null,
    exchangeLoading: 'idle',
    exchangeError: null,
};

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        // Action to clear the profile state, useful when navigating away from a profile page
        clearProfile: (state) => {
            state.profile = null;
            state.loading = 'idle';
            state.error = null;
            state.exchangeData = null;
            state.exchangeLoading = 'idle';
            state.exchangeError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
                state.profile = null; // Clear old profile data on new fetch
            })
            .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<UserProfileData>) => {
                state.loading = 'succeeded';
                state.profile = action.payload;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload || 'Failed to fetch profile.';
            })
            .addCase(followUser.pending, (state, action) => {
                // If we are on a profile page when a follow action happens...
                if (state.profile && state.profile.username === action.meta.arg.username) {
                    // ...optimistically update the follow status and follower count.
                    state.profile.isFollowing = !state.profile.isFollowing;
                    state.profile.followerCount += state.profile.isFollowing ? 1 : -1;
                }
            })
            .addCase(followUser.rejected, (state, action) => {
                // If the API call fails, revert the optimistic update.
                if (state.profile && state.profile.username === action.meta.arg.username) {
                    state.profile.isFollowing = !state.profile.isFollowing;
                    state.profile.followerCount += state.profile.isFollowing ? 1 : -1;
                }
            })
            .addCase(fetchUserExchangeData.pending, (state) => {
                state.exchangeLoading = 'pending';
                state.exchangeError = null;
                state.exchangeData = null;
            })
            .addCase(fetchUserExchangeData.fulfilled, (state, action: PayloadAction<ExchangeData>) => {
                state.exchangeLoading = 'succeeded';
                state.exchangeData = action.payload;
            })
            .addCase(fetchUserExchangeData.rejected, (state, action) => {
                state.exchangeLoading = 'failed';
                state.exchangeError = action.payload || 'Failed to fetch rates.';
            });
    }
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
