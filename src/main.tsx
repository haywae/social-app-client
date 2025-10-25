import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { GOOGLE_CLIENT_ID } from './appConfig.ts'
import { DEVELOPER_MODE } from './appConfig.ts'
import store from './store.ts'
import { appRoutes } from './routes.tsx'
import './styles/index.css'


if (!GOOGLE_CLIENT_ID) {
  DEVELOPER_MODE && console.error("Missing Google Client ID. Please set REACT_APP_GOOGLE_CLIENT_ID in your .env file.");
}

const router = createBrowserRouter(appRoutes)

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <StrictMode>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <RouterProvider router={router} />
      </GoogleOAuthProvider>
    </StrictMode>
  </Provider>
)
