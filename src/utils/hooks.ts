import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import type { TypedUseSelectorHook } from "react-redux";
import { useEffect } from "react";


export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function useTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
