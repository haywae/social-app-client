import { Outlet, useLocation } from "react-router-dom";
import AuthFooter from "./authFooter";
import { ErrorToast } from "../common/errorToast";
import { SuccessToast } from "../common/successToast";
import MobileHeader from "./mobileHeader";
import "./authLayout.css"

// The Layout for unauthenticated users
const AuthLayout = () => {
    const location = useLocation();
    const isLandingPage = location.pathname === '/';
    return (
        <div className="guest-page-wrapper">
            {/* Include shared components like toasts if needed on public pages */}
            <ErrorToast />
            <SuccessToast />
            
            {/* Conditionally render the header: NOT on landing page */}
            {!isLandingPage && <MobileHeader />}

            {/* Conditionally apply 'header-included' class for spacing */}
            <div className={`guest-layout ${!isLandingPage ? "header-included" : ""}`}>
                <main className="guest-content">
                    <Outlet />
                </main>
            </div>
            <AuthFooter />
        </div>
    );
};

export default AuthLayout;