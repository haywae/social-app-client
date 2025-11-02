import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth/authSlice';
import commentReducer from './slices/comments/commentsSlice';
import conversationsReducer from './slices/messaging/conversationsSlice'
import exchangeReducer from './slices/exchange/exchangeSlice';
import messageReducer from './slices/messaging/messageSlice'
import notificationReducer from './slices/notification/notificationSlice';
import registrationReducer from './slices/user/registrationSlice';
import passwordResetReducer from './slices/user/passwordResetSlice';
import postsReducer from './slices/posts/postsSlice';
import profileReducer from './slices/user/userProfileSlice';
import searchReducer from './slices/search/searchSlice';
import settingsReducer from './slices/settings/settingsSlice';
import socketReducer from './slices/socket/socketSlice';
import uiReducer from './slices/ui/uiSlice';
import verifyEmailReducer from './slices/user/verifyEmailSlice';
import { localStorageMiddleware } from './slices/exchange/localStorageMiddleware';



const store = configureStore({
    reducer: {
        auth: authReducer,
        comments: commentReducer,
        conversations: conversationsReducer,
        exchange: exchangeReducer,
        messages: messageReducer,
        notifications: notificationReducer,
        registration: registrationReducer,
        passwordReset: passwordResetReducer,
        posts: postsReducer,
        profile: profileReducer,
        search: searchReducer,
        settings: settingsReducer,
        socket: socketReducer,
        ui: uiReducer,
        verifyEmail: verifyEmailReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(localStorageMiddleware),
})

export default store

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch