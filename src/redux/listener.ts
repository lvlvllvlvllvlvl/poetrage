import {
  TypedAddListener,
  TypedStartListening,
  createListenerMiddleware,
  addListener,
} from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "./store";

export const listenerMiddleware = createListenerMiddleware();

export type AppStartListening = TypedStartListening<RootState, AppDispatch>;

export const startAppListening = listenerMiddleware.startListening as AppStartListening;

export const addAppListener = addListener as TypedAddListener<RootState, AppDispatch>;
