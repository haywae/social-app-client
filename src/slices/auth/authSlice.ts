import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { loginUser, type LoginResponse } from "../../thunks/authThunks/loginThunk";
import { logoutUser } from "../../thunks/authThunks/logoutThunk";
import { refreshToken, type RefreshTokenSuccess, type RefreshReject } from "../../thunks/authThunks/refreshTokenThunk";
import { checkAuth } from "../../thunks/authThunks/authCheckThunk";
import { updateUsername } from "../../thunks/settingsThunks/updateUsernameThunk";
import { updatePassword } from "../../thunks/settingsThunks/updatePasswordThunk";
import { createPassword } from "../../thunks/settingsThunks/createPasswordThunk";

import { requestEmailChange } from "../../thunks/settingsThunks/requestEmailChangeThunk";
import { deleteAccount } from "../../thunks/settingsThunks/deleteAccountThunk";
import { uploadProfilePicture } from "../../thunks/settingsThunks/uploadProfilePictureThunk";
import type { UserData } from "../../types/userType";
import type { UploadPayload } from "../../thunks/settingsThunks/uploadProfilePictureThunk";
import { completeOnboardingThunk, type OnboardingResponse } from "../../thunks/userThunks/completeOnBoardingThunk";
import { setLocalStorage } from "../../utils/authUtils";

// Interface definitions for AuthState, AuthPayload
export interface AuthState {
    user: UserData | null;
    isAuthenticated: boolean;
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error: string | null;
    tokenError: string | null;
    csrfAccessToken: string | null;
    csrfRefreshToken: string | null;
    accessTokenExp: string | null;
    hasInitializedAuth: boolean;
}

// The type for auth main reducers payload/args
interface AuthPayload {
    user: UserData;
    csrf_access_token: string;
    csrf_refresh_token: string;
    access_token_exp: string;
}

// Define a type for the sync payload
interface AuthSyncPayload {
    csrfAccessToken: string;
    csrfRefreshToken: string;
    accessTokenExp: string;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: 'idle',
    error: null,
    tokenError: null,
    csrfAccessToken: null,
    csrfRefreshToken: null,
    accessTokenExp: null,
    hasInitializedAuth: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuthUser: (state, action: PayloadAction<AuthPayload>) => {
            state.user = action.payload.user;
            state.csrfAccessToken = action.payload.csrf_access_token;
            state.csrfRefreshToken = action.payload.csrf_refresh_token;
            state.accessTokenExp = action.payload.access_token_exp;
            state.isAuthenticated = true;
            state.loading = 'succeeded';
            state.error = null;
        },
        setAuthFromSync: (state, action: PayloadAction<AuthSyncPayload>) => {
            state.csrfAccessToken = action.payload.csrfAccessToken;
            state.csrfRefreshToken = action.payload.csrfRefreshToken;
            state.accessTokenExp = action.payload.accessTokenExp;
            setLocalStorage(
                action.payload.accessTokenExp,
                action.payload.csrfAccessToken,
                action.payload.csrfRefreshToken
            );
            localStorage.setItem('auth-sync', JSON.stringify({
                csrfAccessToken: action.payload.csrfAccessToken,
                csrfRefreshToken: action.payload.csrfRefreshToken,
                accessTokenExp: action.payload.accessTokenExp,
            }));
        },
        clearAuth: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = 'idle';
            state.csrfAccessToken = null;
            state.csrfRefreshToken = null;
            state.accessTokenExp = null;
        },
        resetUserError: (state) => {
            state.error = null;
        },
        updateUser: (state, action: PayloadAction<Partial<UserData>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            //----- LOG IN -----
            .addCase(loginUser.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
                // Correctly populate the entire auth state from the thunk's payload
                state.user = action.payload.user;
                state.csrfAccessToken = action.payload.csrf_access_token;
                state.csrfRefreshToken = action.payload.csrf_refresh_token;
                state.accessTokenExp = action.payload.access_token_exp;
                state.isAuthenticated = true;
                state.hasInitializedAuth = true;
                state.loading = 'succeeded';
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload ?? "An unknown login error occurred";
            })
            //----- COMPLETE ONBOARDING -----
            .addCase(completeOnboardingThunk.pending, (state) => {
                // Set loading state to pending while the API call is in progress
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(completeOnboardingThunk.fulfilled, (state, action: PayloadAction<OnboardingResponse>) => {
                // When successful, update the user state with the complete user object from the API
                state.user = action.payload.user;
                // Ensure auth state is consistent
                state.isAuthenticated = true;
                state.loading = 'succeeded';
                state.error = null;
            })
            .addCase(completeOnboardingThunk.rejected, (state, action) => {
                // If the API call fails, set loading state to failed and store the error message
                state.loading = 'failed';
                state.error = action.payload ?? 'Failed to complete profile.';
            })

            //----- LOG OUT -----
            .addCase(logoutUser.fulfilled, (state) => {
                // Use the clearAuth reducer's logic for a clean logout
                state.user = null;
                state.isAuthenticated = false;
                state.loading = 'succeeded'; // Set loading to 'succeeded'
                state.error = null;
            })

            //----- REFRESH TOKEN -----
            .addCase(refreshToken.fulfilled, (state, action: PayloadAction<RefreshTokenSuccess>) => {
                state.csrfAccessToken = action.payload.csrf_access_token;
                state.csrfRefreshToken = action.payload.csrf_refresh_token;
                state.accessTokenExp = action.payload.access_token_exp;
                state.tokenError = null;
            })
            .addCase(refreshToken.rejected, (state, action: PayloadAction<RefreshReject | undefined>) => {
                if (action.payload?.type === 'auth') {
                    state.user = null;
                    state.isAuthenticated = false;
                    state.csrfAccessToken = null;
                    state.csrfRefreshToken = null;
                    state.accessTokenExp = null;
                    state.tokenError = 'Session expired. Please log in again.';
                } else {
                    state.tokenError = action.payload?.message ?? 'A network error occurred. Please try again.s';
                }
            })

            //----- CHECK AUTH / AUTHENTICATE -----
            .addCase(checkAuth.pending, (state) => {
                state.loading = 'pending';
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.csrfAccessToken = action.payload.csrf_access_token;
                state.csrfRefreshToken = action.payload.csrf_refresh_token;
                state.accessTokenExp = action.payload.access_token_exp;
                state.isAuthenticated = true;
                state.hasInitializedAuth = true;
                state.loading = 'succeeded';
                state.error = null;
            })
            .addCase(checkAuth.rejected, (state, action: PayloadAction<RefreshReject | undefined>) => {
                if (action.payload?.type === 'auth') {
                    state.user = null;
                    state.isAuthenticated = false;
                    state.csrfAccessToken = null;
                    state.csrfRefreshToken = null;
                    state.accessTokenExp = null;
                    state.loading = 'failed';
                }
                else {
                    // It was a NETWORK error. DO NOT log the user out.
                    // The user is still "authenticated" but offline.
                    state.loading = 'failed';
                    state.error = action.payload?.message || 'Failed to connect to server.';
                }
                state.hasInitializedAuth = true;
            })

            //----- UPDATE USERNAME -----
            .addCase(updateUsername.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(updateUsername.fulfilled, (state, action: PayloadAction<UserData>) => {
                if (state.user) {
                    state.user = { ...state.user, ...action.payload };
                }
                state.loading = 'succeeded';
                state.error = null;
            })
            .addCase(updateUsername.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload ?? 'Failed to update username.';
            })

            //----- UPDATE PASSWORD -----
            .addCase(updatePassword.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(updatePassword.fulfilled, (state) => {
                state.loading = 'succeeded';
                state.error = null;
            })
            .addCase(updatePassword.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload ?? 'Failed to update password.';
            })

            //----- REQUEST EMAIL CHANGE -----
            .addCase(requestEmailChange.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(requestEmailChange.fulfilled, (state) => {
                state.loading = 'succeeded';
                state.error = null;
            })
            .addCase(requestEmailChange.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload ?? 'Failed to request email change.';
            })

            //----- DELETE ACCOUNT -----
            .addCase(deleteAccount.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(deleteAccount.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = 'succeeded'; // Set loading to 'succeeded'
                state.error = null;
            })
            .addCase(deleteAccount.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload ?? 'Failed to delete account.';
            })
            .addCase(uploadProfilePicture.fulfilled, (state, action: PayloadAction<UploadPayload>) => {
                // Check if there is a logged-in user to update
                if (state.user) {
                    state.user.profilePictureUrl = action.payload.profilePictureUrl;
                }
            })
            .addCase(createPassword.fulfilled, (state) => {
                if (state.user) {
                    state.user.hasPassword = true;
                }
            });
    }
});

export const { setAuthUser, clearAuth, resetUserError, setAuthFromSync, updateUser } = authSlice.actions;
export default authSlice.reducer;