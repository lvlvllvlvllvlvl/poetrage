import { setters } from "redux/app";
import { startAppListening } from "redux/listener";

startAppListening({
  predicate: (action, currentState, previousState) =>
    currentState.app.hideNonTextFilters !== previousState.app.hideNonTextFilters,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState().app;

    const filters = state.columnFilters;
    const nameFilter = filters?.filter(({ id }) => id === "Name") || [];
    const nonNameFilters = filters?.filter(({ id }) => id !== "Name") || [];
    const enable = !state.hideNonTextFilters;
    if (enable !== state.enableColumnFilter) {
      const setter = setters(listenerApi.dispatch);
      setter.setEnableColumnFilter(enable);

      if (enable && state.savedColumnFilters) {
        setter.setSavedColumnFilters(undefined);
        setter.setColumnFilters(state.savedColumnFilters.concat(nameFilter));
      } else if (!enable) {
        setter.setSavedColumnFilters(nonNameFilters);
        setter.setColumnFilters(nameFilter);
      }
    }
  },
});
