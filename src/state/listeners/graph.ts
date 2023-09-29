import { shallowEqual } from "react-redux";
import { setters } from "state/app";
import { startAppListening } from "state/listener";
import { graphInputs } from "state/selectors/graphInputs";
import { AppDispatch } from "state/store";
import Worker from "state/workers/buildGraph.ts?worker";

const worker = new Worker();

startAppListening({
  predicate: (action, currentState, previousState) => {
    return (
      (!currentState.app.progressMsg ||
        currentState.app.progressMsg === "Calculating temple corruption outcomes") &&
      (currentState.app.progressMsg !== previousState.app.progressMsg ||
        !shallowEqual(graphInputs(previousState), graphInputs(currentState)))
    );
  },

  effect: async (action, listenerApi) => {
    try {
      const inputs = graphInputs(listenerApi.getState());
      if (!inputs.data.length) {
        return;
      }

      console.debug("Starting graph worker");

      const { setGraphData, setXpGraphData, setGraphProgress, setGraphProgressMsg } = setters(
        listenerApi.dispatch as AppDispatch,
      );

      worker.postMessage(inputs);
      worker.onmessage = (e) => {
        if (e.data.action === "data") {
          setGraphData(e.data.payload);
        } else if (e.data.action === "xpdata") {
          setXpGraphData(e.data.payload);
        } else if (e.data.action === "progress") {
          setGraphProgress(e.data.payload);
        } else if (e.data.action === "msg") {
          setGraphProgressMsg(e.data.payload);
        } else {
          console.debug(e.data);
        }
      };
    } catch (e) {
      console.error(e);
    }
  },
});
