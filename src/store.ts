import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth/authSlice';
import notificationReducer from './slices/notification/notificationSlice';
import registrationReducer from './slices/user/registrationSlice';
import passwordResetReducer from './slices/user/passwordResetSlice';
import postsReducer from './slices/posts/postsSlice';
import profileReducer from './slices/user/userProfileSlice';
import settingsReducer from './slices/settings/settingsSlice';
import socketReducer from './slices/socket/socketSlice';
import uiReducer from './slices/ui/uiSlice';
import verifyEmailReducer from './slices/user/verifyEmailSlice';




const store = configureStore({
    reducer: {
        auth: authReducer,
        notifications: notificationReducer,
        registration: registrationReducer,
        passwordReset: passwordResetReducer,
        posts: postsReducer,
        profile: profileReducer,
        settings: settingsReducer,
        socket: socketReducer,
        ui: uiReducer,
        verifyEmail: verifyEmailReducer,
    },
})

export default store

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch