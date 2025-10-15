import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import store from './store.ts'
import './styles/index.css'
import App from './App.tsx'
import CreatePostPage from './pages/createPostPage.tsx'
import ExchangePage from './pages/exchangePage.tsx'
import ErrorPage from './pages/errorPage.tsx'
import ForgotPassword from './pages/authPages/forgotPassword.tsx'
import Home from './pages/home.tsx'
import Login from './pages/authPages/login.tsx'
import NotFoundPage from './pages/notFound.tsx'
import NotificationsPage from './pages/notificationsPage.tsx'
import ResetPassword from './pages/authPages/resetPassword.tsx'
import SearchPage from './pages/searchPage.tsx'
import SettingsPage from './pages/settingsPages/settingsPage.tsx'
import PostDetailPage from './pages/postDetailPage.tsx'
import Signup from './pages/authPages/register.tsx'
import UserProfilePage from './pages/userProfilePage.tsx'
import AccountManagementPage from './pages/settingsPages/accountManagementPage.tsx'
import ProfileSettingsPage from './pages/settingsPages/profileSettingsPage.tsx'
import SecurityPrivacyPage from './pages/settingsPages/securityPrivacyPage.tsx'
import VerifyEmailPage from './pages/authPages/verifyEmail.tsx'
import ConfirmEmailChangePage from './pages/authPages/confirmNewEmailChangePage.tsx'
import ViewPage from './pages/viewPage.tsx'
import PrivacyPolicy from './pages/legal/privacyPolicy.tsx'
import TermsAndConditions from './pages/legal/termsAndConditions.tsx'
import CookiePolicy from './pages/legal/cookiePolicy.tsx'
import ContactPage from './pages/legal/contact.tsx'
import AboutPage from './pages/legal/about.tsx'


const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    errorElement: <ErrorPage/>,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/register',
        element: <Signup />
      },
      {
        path: '/reset-password', 
        element: <ResetPassword />
      },
      // +-+-+-+-+ Authenticated Pages +-+-+-+-+
      {
        path: '/exchange',
        element: < ExchangePage/>
      },
      {
        path: '/home',
        element: <Home />
      },
      {
        path: '/notifications',
        element: <NotificationsPage />
      },
      {
        path: '/post',
        element: <CreatePostPage />
      },
      {
        path: '/post/:postId',
        element: <PostDetailPage />
      },
      {
        path: '/profile/:username',
        element: <UserProfilePage />
      },
      {
        path: '/search',
        element: <SearchPage />
      },
      {
        path: '/settings',
        element: <SettingsPage />
      },
      {
        path: '/settings/account',
        element: <AccountManagementPage />
      },
      {
        path: '/settings/profile',
        element: <ProfileSettingsPage />
      },
      {
        path: '/settings/security',
        element: <SecurityPrivacyPage />
      },
      {
        path: '/view',
        element: <ViewPage />
      },
      {
        path: '/*',
        element: <NotFoundPage />
      },
    ]
  }, 
  {
    path: '/verify-email',
    element: <VerifyEmailPage />
  },
  {
    path: '/confirm-email-change',
    element: <ConfirmEmailChangePage />
  },
  {
    path: '/privacy-policy',
    element: <PrivacyPolicy />
  },
  {
    path: '/terms-and-conditions',
    element: <TermsAndConditions />
    },
  {
    path: '/cookie-policy',
    element: <CookiePolicy />
  },
  {
    path: '/contact',
    element: <ContactPage />
  },
  {
    path: '/about',
    element: <AboutPage />
  },
],)

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <StrictMode>
      <RouterProvider router={router}/>
    </StrictMode>
  </Provider>
)
