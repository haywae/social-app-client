import { useEffect, type JSX } from "react";
import { Outlet } from "react-router-dom";
import { checkAuth } from "../../thunks/authThunks/authCheckThunk";
import { useAppDispatch } from "../../utils/hooks";
import { ErrorToast } from "../common/errorToast";
import { SuccessToast } from "../common/successToast";
import ModalManager from "../modals/modalManager";

/**
 * Custom hook to manage global authentication side-effects.
 * This should run only once at the highest level of the application.
 */
const useGlobalAuthEffects = () => {
    const dispatch = useAppDispatch();

    // Effect for the initial authentication check on app load
    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);
};

/**
 * RootLayout is the top-level layout component for the entire application.
 * It's responsible for rendering global components like toasts and modals,
 * and running the initial authentication check.
 */
const RootLayout = (): JSX.Element => {
    useGlobalAuthEffects();

    return (
        <>
            <ErrorToast />
            <SuccessToast />
            <ModalManager />
            <Outlet /> {/* This will render the matched child route */}
        </>
    );
}

export default RootLayout;

