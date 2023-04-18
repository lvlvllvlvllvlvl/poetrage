import { shallowEqual } from "react-redux";
import { setters } from "redux/app";
import { startAppListening } from "redux/listener";
import { profitInputs } from "redux/selectors/profitInputs";
import { AppDispatch } from "redux/store";

const worker = new Worker(new URL("web-worker/calculateProfits.ts", import.meta.url));
let cancel: string;

startAppListening({
  predicate: (action, currentState, previousState) => {
    return !shallowEqual(profitInputs(currentState), profitInputs(previousState));
  },

  effect: async (action, listenerApi) => {
    try {
      const inputs = profitInputs(listenerApi.getState());
      const { gems, currencyMap, leagueIsIndexed, meta, gemInfo } = inputs;

      if (
        gems.status !== "done" ||
        currencyMap.status !== "done" ||
        (leagueIsIndexed && meta.status !== "done") ||
        gemInfo.status !== "done"
      ) {
        return;
      }

      console.debug("Starting profit worker");
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
