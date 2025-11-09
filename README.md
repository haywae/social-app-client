# **Frontend Application README**

This is a modern, single-page application (SPA) built with **React** and **TypeScript**. It uses **React Router v6** for navigation and **Redux Toolkit** for robust, centralized state management.

The application features a high-security, stateful, cookie-based authentication system designed for robustness against CSRF, XSS, and token replay attacks. It includes advanced features like multi-tab state synchronization and "self-healing" network logic to handle flaky connections and complex multi-tab scenarios.

## **🚀 Core Technologies**

* **UI Library:** React 18+ (Hooks & Functional Components)  
* **Language:** TypeScript  
* **State Management:** Redux Toolkit (Slices, Async Thunks)  
* **Routing:** React Router 6 (createBrowserRouter)  
* **Real-time:** Socket.IO Client  
* **Backend (Auth Service):** Flask, Flask-JWT-Extended  
* **Session Caching:** Redis (for token blocklisting)

## **🚀 Getting Started**

To run the frontend application locally, you will need to set up the following environment variables.

1. Clone the repository:  
  git clone \[your-repo-url\]  
  cd \[your-repo-folder\]

2. Install the dependencies:  
  npm install

3. Create a .env.local file in the root of the project and add the following variables:  
  \# The full URL to your backend API  
  \# Example: http://localhost:5000 or \[https://api.yourdomain.com\](https://api.yourdomain.com)  
  VITE\_API\_BASE\_URL=YOUR\_BACKEND\_API\_URL

  \# The full URL to your backend Socket.IO server  
  \# Example: http://localhost:5000 or \[https://api.yourdomain.com\](https://api.yourdomain.com)  
  VITE\_SOCKET\_URL=YOUR\_BACKEND\_SOCKET\_URL

  \# The base URL for serving static images (e.g., a CDN or your backend's static folder)  
  \# Example: \[https://cdn.yourdomain.com\](https://cdn.yourdomain.com) or http://localhost:5000/static  
  VITE\_IMAGE\_BASE\_URL=YOUR\_CDN\_OR\_IMAGE\_SERVER\_URL

4. Start the development server:  
  npm run dev

This will start the Vite development server, typically on http://localhost:5173.

## **🏛️ Application Architecture & Layouts**

The application's entry point is main.tsx, which sets up the Redux Provider and the React Router RouterProvider. The routing itself, defined in routes.tsx, is the key to understanding the app's structure. There are three primary layout components that nest to create the user experience:

### **1\. RootLayout.tsx (The Global Parent)**

* **Role:** This is the highest-level component for the *entire* application, rendered on every page.  
* **Responsibilities:**  
  * **Initial Auth Check:** Contains a useGlobalAuthEffects hook that dispatches the checkAuth() thunk on initial app load. This verifies the user's session before any page is fully rendered.  
  * **Cross-Tab Sync:** Listens for localStorage events (on the auth-sync key) to synchronize authentication state (login/logout) across all open browser tabs.  
  * **Global Components:** Renders app-wide singletons like ErrorToast, SuccessToast, and the ModalManager.  
* It contains an \<Outlet /\> that renders the appropriate child layout (e.g., AuthLayout or the protected \<App /\>).

### **2\. AuthLayout.tsx (The Guest Layout)**

* **Role:** This layout is for all **unauthenticated** users.  
* **Used For:** The landing page (/), /login, /register, /forgot-password, etc.  
* **Features:** It provides a minimal structure, including a conditional MobileHeader (hidden on the main landing page) and an AuthFooter. It renders the specific public page (e.g., Login) via its own \<Outlet /\>.

### **3\. App.tsx (The Main App Layout)**

* **Role:** This is the primary layout for all **authenticated** users. It *is* the core application interface.  
* **Features:**  
  * Renders the main UI shell: LeftSidebar, RightSidebar, and the main MobileHeader.  
  * Renders the specific protected page (e.g., /feed, /settings) via its \<Outlet /\>.  
  * **Socket.IO Management:** Responsible for connecting (connectSocket) and disconnecting (disconnectSocket) the WebSocket based on the user's authentication status.  
  * **Authenticated Data:** Contains a useAuthenticatedData hook to fetch user-specific data (like notifications and settings) once the user is logged in.

### **🔒 ProtectedRoute.tsx (The Gatekeeper)**

The app's auth flow is managed by this component in combination with the Redux auth slice.

1. A user attempts to access a protected route (e.g., /feed).  
2. RootLayout dispatches checkAuth(). The auth.loading state is set to pending.  
3. The router renders \<ProtectedRoute\> as the wrapper for the route.  
4. **ProtectedRoute** checks the Redux state:  
  * **While loading \=== 'pending':** It renders a FullPageLoader to prevent any UI "flash" (like showing the landing page for a split second).  
  * **If loading \=== 'failed':** It renders a ConnectionError component.  
  * **If isAuthenticated \=== true:** The check succeeded. It renders its children, which is the entire \<App /\> layout.  
  * **If isAuthenticated \=== false:** The check failed. It **blocks rendering** \<App /\> and instead renders the \<LandingPage /\> component, effectively redirecting the user to sign in.

## **🛡️ Authentication System Overview**

This application implements a high-security, stateful, cookie-based authentication system. It is built on a **"Double Submit Cookie"** pattern for CSRF protection and uses **rotating refresh tokens** with server-side blocklisting to ensure a high level of security.

### **Backend Authentication**

The backend is built with Flask and flask-jwt-extended, prioritizing security by handling all session tokens in secure, HttpOnly cookies.

* **Secure Cookie Storage:** All JWTs (both access and refresh tokens) are stored in **HttpOnly cookies**. This makes them inaccessible to client-side JavaScript, mitigating the risk of XSS attacks.  
* **CSRF Protection (Double Submit Cookie):**  
  * To protect against CSRF attacks, the system complements the HttpOnly cookies with separate CSRF tokens.  
  * Upon login or refresh, the server sends csrf\_access\_token and csrf\_refresh\_token in the JSON response body.  
  * The frontend client is required to read these tokens and send one back in the **X-CSRF-TOKEN** header with every request. The backend validates this header against the JWT cookie to authorize the request.  
* **High-Security Token Rotation:**  
  * To prevent token replay attacks, the system employs token rotation.  
  * When the /refresh-token endpoint is successfully used, the backend immediately **blocklists the incoming refresh token** in a Redis database.  
  * It then issues a brand new set of access and refresh tokens. This ensures that each refresh token is single-use.  
* **Stateful Logout:**  
  * Logging out is a server-side action. The /logout endpoint **blocklists the user's active access token** for its remaining duration.  
  * This ensures that even if a token is stolen, it is invalidated immediately upon logout.  
* **Environment-Aware Configuration:**  
  * The system dynamically adjusts its cookie settings:  
  * **Production:** Uses SameSite=None and Secure=True to allow cross-domain authentication.  
  * **Development:** Uses SameSite=Lax and Secure=False for ease of local testing.  
* **WebSocket Authentication:**  
  * Socket.IO connections are authenticated separately using a connect handler.  
  * The handler manually decodes the access\_token\_cookie from the connection request to verify the user's identity before establishing the real-time connection.

### **Frontend Authentication**

The frontend features a "self-healing" and "tab-aware" authentication client centered around a smart API interceptor and the Redux state.

* **The apiInterceptor (The Brain):**  
  * A custom apiInterceptor wraps all outgoing fetch requests.  
  * It automatically reads the csrfAccessToken from the Redux state and attaches it to the **X-CSRF-TOKEN** header of every request.  
  * It is responsible for handling all **401 (Unauthorized)** responses.  
* **Refresh Race Condition Handling:**  
  * The interceptor is built to handle scenarios where multiple API calls fail at once with a 401\.  
  * It uses an isRefreshing boolean flag and a failedQueue to ensure that only the *first* failed request triggers refreshToken().  
  * All subsequent requests are queued and retried automatically after a new token is obtained.  
* **Robust Error Handling:**  
  * The interceptor and thunks intelligently distinguish between a fatal **'auth' error** (like a 401 on the refresh endpoint) and a temporary **'network' error** (like a 500 server error or no internet).  
  * Only 'auth' errors will trigger a logoutUser() dispatch. 'network' errors allow the user to stay "authenticated but offline."  
* **Multi-Tab & Stale Tab Syncing:**  
  * The system keeps authentication state synced across all open browser tabs, preventing "stale tab" logout bugs.  
  * When a token is refreshed, the refreshTokenThunk writes the new CSRF tokens to a special localStorage key named **auth-sync**.  
  * A global storage event listener in **RootLayout.tsx** listens for this change.  
  * When a background tab hears this event, it dispatches setAuthFromSync, which updates its own Redux state and re-broadcasts the auth-sync key, creating a chain reaction that updates all tabs.  
* **Redux as Single Source of Truth:**  
  * To prevent race conditions, the apiInterceptor and refreshTokenThunk both read CSRF tokens directly from the **Redux state** (store.getState().auth.csrf...) instead of localStorage. This ensures they always use the most up-to-date, tab-synced token.  
* **Smart Reconnection Logic:**  
  * The app gracefully handles being backgrounded. A visibilitychange listener in **App.tsx** dispatches checkAuth() when the tab becomes visible, triggering the interceptor to refresh the token if needed.  
  * The apiInterceptor also proactively calls connectSocket() after any successful token refresh, ensuring the real-time connection is re-established immediately.