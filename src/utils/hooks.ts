import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import type { TypedUseSelectorHook } from "react-redux";
import { useEffect } from "react";


export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function useTitle(title: string) {
  const unreadNotifications = useAppSelector((state) => (state.notifications.unreadCount))
  useEffect(() => {
    const totalUnreadCount = unreadNotifications;

    if (totalUnreadCount > 0) {
      document.title = `(${totalUnreadCount}) | ${title} - Ayo's Social App `
    } else {
      document.title = `${title} - Ayo's Social App`;
    }
  }, [title, unreadNotifications]);
}
