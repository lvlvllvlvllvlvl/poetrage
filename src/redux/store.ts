import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { apiSlice } from "redux/api";
import { appSlice } from "./app";
import { listenerMiddleware } from "./listener";
import { setAutoFreeze } from "immer";

setAutoFreeze(false);

export const store = configureStore({
  reducer: { app: appSlice.reducer, [apiSlice.reducerPath]: apiSlice.reducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ immutableCheck: false, serializableCheck: false })
      .prepend(listenerMiddleware.middleware)
      .concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
