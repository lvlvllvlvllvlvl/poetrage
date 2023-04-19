import { leagues } from "state/api";
import { setters } from "state/app";
import { startAppListening } from "state/listener";

startAppListening({
  predicate: (action, currentState, previousState) => {
    return !currentState.app.league && leagues(currentState).status === "done";
  },

  effect: async (action, listenerApi) => {
    const league = leagues(listenerApi.getState());
    if (league.status === "done") {
      setters(listenerApi.dispatch).setLeague(league.value.economyLeagues[0]);
    }
  },
});
