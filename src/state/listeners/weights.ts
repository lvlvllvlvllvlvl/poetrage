import { shallowEqual } from "react-redux";
import { setters } from "state/app";
import { startAppListening } from "state/listener";
import { weightInputs } from "state/selectors/weightInputs";
import { AppDispatch } from "state/store";

const worker = new Worker(new URL("state/workers/corruptedMods.ts", import.meta.url));
let cancel: string;

startAppListening({
  predicate: (action, currentState, previousState) => {
    return !shallowEqual(weightInputs(currentState), weightInputs(previousState));
  },

  effect: async (action, listenerApi) => {
    try {
      const inputs = weightInputs(listenerApi.getState());
      const { mods, uniques, translations } = inputs;

      if (
        mods.status !== "done" ||
        uniques.status !== "done" ||
        translations.status !== "done"
      ) {
        return;
      }

      console.debug("Starting weight worker");
      URL.revokeObjectURL(cancel);

      const { setUniqueData, setUniqueProgress, setUniqueProgressMsg } = setters(listenerApi.dispatch as AppDispatch);

      cancel = URL.createObjectURL(new Blob());
      worker.postMessage({ inputs, cancel });
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
