import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import store from './store.ts'
import { appRoutes } from './routes.tsx'
import './styles/index.css'

const router = createBrowserRouter(appRoutes)

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
  </Provider>
)
