import type { RouteObject } from "react-router-dom";

// Layouts & Page Components
import App from './App.tsx';
import ErrorPage from "./pages/errorPage.tsx";
import Home from './pages/home.tsx';
import Login from './pages/authPages/login.tsx';
import Signup from './pages/authPages/register.tsx';
import ForgotPassword from './pages/authPages/forgotPassword.tsx';
import ResetPassword from './pages/authPages/resetPassword.tsx';
import VerifyEmailPage from './pages/authPages/verifyEmail.tsx';
import ConfirmEmailChangePage from './pages/authPages/confirmNewEmailChangePage.tsx';
import NotFoundPage from './pages/notFound.tsx';
import ProtectedRoute from "./components/auth/protectedRoute.tsx";
import AuthLayout from "./components/layout/authLayout.tsx";
import CompleteProfilePage from "./pages/completeProfilePage.tsx";

// --- Layouts and Pages ---
import RootLayout from "./components/layout/rootLayout.tsx";
import HomePage from "./pages/homepageController.tsx";
import HybridLayout from "./components/layout/hybridLayout.tsx";

// --- Legal & Static Pages ---
import PrivacyPolicy from './pages/legal/privacyPolicy.tsx';
import TermsAndConditions from './pages/legal/termsAndConditions.tsx';
import CookiePolicy from './pages/legal/cookiePolicy.tsx';
import ContactPage from './pages/legal/contact.tsx';
import AboutPage from './pages/legal/about.tsx';

// --- Authenticated App Pages ---
import CreatePostPage from './pages/createPostPage.tsx';
import ExchangePage from './pages/exchangePage.tsx';
import NotificationsPage from './pages/notificationsPage.tsx';
import SearchPage from './pages/searchPage.tsx';
import SettingsPage from './pages/settingsPages/settingsPage.tsx';
import PostDetailPage from './pages/postDetailPage.tsx';
import UserProfilePage from './pages/userProfilePage.tsx';
import AccountManagementPage from './pages/settingsPages/accountManagementPage.tsx';
import ProfileSettingsPage from './pages/settingsPages/profileSettingsPage.tsx';
import SecurityPrivacyPage from './pages/settingsPages/securityPrivacyPage.tsx';

import ChangeEmailPage from "./pages/settingsPages/changeEmailPage.tsx";
import ChangePasswordPage from "./pages/settingsPages/changePasswordPage.tsx";
import ChangeUsernamePage from "./pages/settingsPages/changeUsernamePage.tsx";

import ViewPage from './pages/viewPage.tsx';

export const appRoutes: RouteObject[] = [
    {
        // The RootLayout handles global concerns like auth checks and toasts
        element: <RootLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                // Public auth flow pages (Login, Register, etc.)
                element: <AuthLayout />,
                children: [
                    // --- PUBLIC ROUTES ---
                    {
                        // The root path now uses the HomePage controller
                        index: true,
                        element: <HomePage />
                    },
                    { path: 'login', element: <Login /> },
                    { path: 'register', element: <Signup /> },
                    { path: 'forgot-password', element: <ForgotPassword /> },
                    { path: 'reset-password', element: <ResetPassword /> },
                    { path: 'verify-email', element: <VerifyEmailPage /> },
                    { path: 'confirm-email-change', element: <ConfirmEmailChangePage /> },
                    // --- Other public static pages ---
                    { path: 'privacy-policy', element: <PrivacyPolicy /> },
                    { path: 'terms-and-conditions', element: <TermsAndConditions /> },
                    { path: 'cookie-policy', element: <CookiePolicy /> },
                    { path: 'contact', element: <ContactPage /> },
                    { path: 'about', element: <AboutPage /> },

                ]
            },
            // --- PROTECTED ROUTES (THE MAIN APP) ---
            {
                // This group is wrapped by the ProtectedRoute guard
                element: (
                    <ProtectedRoute>
                        <App />
                    </ProtectedRoute>
                ),
                children: [
                    // The authenticated "home" is now at /feed
                    { path: 'feed', element: <Home /> },
                    { path: 'exchange', element: <ExchangePage /> },
                    { path: 'notifications', element: <NotificationsPage /> },
                    { path: 'post', element: <CreatePostPage /> },
                    { path: 'post/:postId', element: <PostDetailPage /> },
                    { path: 'profile/:username', element: <UserProfilePage /> },
                    { path: 'search', element: <SearchPage /> },
                    { path: 'settings', element: <SettingsPage /> },
                    { path: 'settings/account', element: <AccountManagementPage /> },
                    { path: 'settings/account/username', element: <ChangeUsernamePage /> },
                    { path: 'settings/account/password', element: <ChangePasswordPage /> },
                    { path: 'settings/account/email', element: <ChangeEmailPage /> },
                    { path: 'settings/profile', element: <ProfileSettingsPage /> },
                    { path: 'settings/security', element: <SecurityPrivacyPage /> },
                    { path: 'complete-profile', element: <CompleteProfilePage /> },
                ]
            },
             // --- HYBRID ROUTES (AUTH OR GUEST) ---
            {
                // This layout handles pages accessible to both auth/guest
                // It renders <App /> or <AuthLayout /> accordingly
                element: <HybridLayout />,
                children: [
                    { path: 'view', element: <ViewPage /> },
                ]
            },


            // --- CATCH-ALL 404 ROUTE ---
            { path: '*', element: <NotFoundPage /> },
        ]
    }
];

