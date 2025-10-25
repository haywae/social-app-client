import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth/authSlice';
import registrationReducer from './slices/user/registrationSlice';
import passwordResetReducer from './slices/user/passwordResetSlice';
import postsReducer from './slices/posts/postsSlice';
import profileReducer from './slices/user/userProfileSlice';
import notificationReducer from './slices/notification/notificationSlice';
import settingsReducer from './slices/settings/settingsSlice';
import exchangeReducer from './slices/exchange/exchangeSlice';
import searchReducer from './slices/search/searchSlice';
import commentReducer from './slices/comments/commentsSlice';
import verifyEmailReducer from './slices/user/verifyEmailSlice';
import uiReducer from './slices/ui/uiSlice'
import { localStorageMiddleware } from './slices/exchange/localStorageMiddleware';



const store = configureStore({
    reducer: {
        auth: authReducer,
        notifications: notificationReducer,
        registration: registrationReducer,
        passwordReset: passwordResetReducer,
        posts: postsReducer,
        profile: profileReducer,
        settings: settingsReducer,
        exchange: exchangeReducer,
        search: searchReducer,
        comments: commentReducer,
        ui: uiReducer,
        verifyEmail: verifyEmailReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(localStorageMiddleware),
})

export default store

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch