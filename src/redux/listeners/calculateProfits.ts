import { createSelector } from "@reduxjs/toolkit";
import "App.css";
import { shallowEqual } from "react-redux";
import { currencyMap, gemInfo, gems, meta } from "redux/api";
import { setters } from "redux/app";
import { startAppListening } from "redux/listener";
import { AppDispatch, RootState } from "redux/store";

export const getInputs = createSelector(
  [
    gems,
    currencyMap,
    ({ app }: RootState) => app.league?.indexed,
    meta,
    gemInfo,
    ({ app }: RootState) => app.filterMeta.debounced,
    ({ app }: RootState) => app.overrides,
    ({ app }: RootState) => app.sanitize,
    ({ app }: RootState) => app.lowConfidence,
    ({ app }: RootState) => app.incQual.debounced,
    ({ app }: RootState) => app.mavenExclusiveWeight.debounced,
    ({ app }: RootState) => app.mavenCrucibleWeight.debounced,
  ],
  (...args) => args
);

export type Inputs = ReturnType<typeof getInputs>;

const worker = new Worker(new URL("./Worker.ts", import.meta.url));
let cancel: string;

startAppListening({
  predicate: (action, currentState, previousState) => {
    return !shallowEqual(getInputs(currentState), getInputs(previousState));
  },

  effect: async (action, listenerApi) => {
    try {
      const inputs = getInputs(listenerApi.getState());
      const [gems, currencyMap, leagueIsIndexed, meta, gemInfo] = inputs;

      if (
        gems.status !== "done" ||
        currencyMap.status !== "done" ||
        (leagueIsIndexed && meta.status !== "done") ||
        gemInfo.status !== "done"
      ) {
        return;
      }

      console.log("Starting worker");
      URL.revokeObjectURL(cancel);

      const { setData, setProgress, setProgressMsg } = setters(listenerApi.dispatch as AppDispatch);

      cancel = URL.createObjectURL(new Blob());
      worker.postMessage({ inputs, cancel });
      worker.onmessage = (e) => {
        if (e.data.action === "data") {
          setData(e.data.payload);
        } else if (e.data.action === "progress") {
          setProgress(e.data.payload);
        } else if (e.data.action === "msg") {
          setProgressMsg(e.data.payload);
        } else {
          console.debug(e.data);
        }
      };
    } catch (e) {
      console.error(e);
    }
  },
});
