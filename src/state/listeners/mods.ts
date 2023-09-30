import { shallowEqual } from "react-redux";
import { apiSlice } from "state/api";
import { setters } from "state/app";
import { startAppListening } from "state/listener";
import { modInputs } from "state/selectors/modInputs";
import { AppDispatch } from "state/store";
import Worker from "state/workers/corruptedMods.ts?worker";

let worker = new Worker();

const reset = apiSlice.util.resetApiState().type;

startAppListening({
  predicate: (action, currentState, previousState) => {
    const inputs = modInputs(currentState);
    return (
      action.type === reset ||
      (!!inputs.league &&
        inputs.tab === "corruptions" &&
        !shallowEqual(inputs, modInputs(previousState)))
    );
  },

  effect: async (action, listenerApi) => {
    try {
      console.debug("Starting weight worker");

      const { setUniqueData, setUniqueProgress, setUniqueProgressMsg } = setters(
        listenerApi.dispatch as AppDispatch,
      );

      if (action.type === reset) {
        console.debug("Cancel weight worker");
        setUniqueData(undefined);
        setUniqueProgressMsg("");
        worker.terminate();
        worker = new Worker();
        return;
      }

      worker.postMessage(modInputs(listenerApi.getState()));
      worker.onmessage = (e) => {
        if (e.data.action === "data") {
          setUniqueData(e.data.payload);
        } else if (e.data.action === "progress") {
          setUniqueProgress(e.data.payload);
        } else if (e.data.action === "msg") {
          setUniqueProgressMsg(e.data.payload);
        } else {
          console.debug(e.data);
        }
      };
    } catch (e) {
      console.error(e);
    }
  },
});
