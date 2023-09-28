import { shallowEqual } from "react-redux";
import { setters } from "state/app";
import { startAppListening } from "state/listener";
import { profitInputs } from "state/selectors/profitInputs";
import { AppDispatch } from "state/store";
import Worker from "workers/calculateProfits.ts?worker";

const worker = new Worker();

startAppListening({
  predicate: (action, currentState, previousState) => {
    return !shallowEqual(profitInputs(currentState), profitInputs(previousState));
  },

  effect: async (action, listenerApi) => {
    try {
      const inputs = profitInputs(listenerApi.getState());
      const { gems, currencyMap, leagueIsIndexed, meta } = inputs;

      if (
        gems.status !== "done" ||
        currencyMap.status !== "done" ||
        (leagueIsIndexed && meta.status !== "done")
      ) {
        return;
      }

      console.debug("Starting profit worker");

      const { setData, setProgress, setProgressMsg } = setters(listenerApi.dispatch as AppDispatch);

      worker.postMessage(inputs);
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
