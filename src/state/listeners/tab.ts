import { setters } from "state/app";
import { startAppListening } from "state/listener";

const DEFAULT_SORT = {
  "gem flipping": [
    { id: "Pinned", desc: true },
    { id: "ratio", desc: true },
  ],
  "gem xp": [
    { id: "Pinned", desc: true },
    { id: "Levelling", desc: true },
  ],
  lab: [
    { id: "Pinned", desc: true },
    { id: "transValue", desc: true },
  ],
};

startAppListening({
  predicate: (action, currentState, previousState) =>
    currentState.app.tab !== previousState.app.tab,
  effect: async (action, listenerApi) => {
    setters(listenerApi.dispatch).setSorting(DEFAULT_SORT[listenerApi.getState().app.tab]);
  },
});
