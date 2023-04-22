import { createSelector } from "@reduxjs/toolkit";
import { createApi, skipToken } from "@reduxjs/toolkit/query/react";
import { getCurrencyOverview } from "apis/getCurrencyOverview";
import { getGemOverview } from "apis/getGemOverview";
import { getGemInfo } from "apis/getGemInfo";
import { getLeagues } from "apis/getLeagues";
import { getMeta } from "apis/getMeta";
import {
  getAwakenedLevelAverage,
  getAwakenedRerollAverage,
  getTempleAverage,
} from "apis/getPrices";
import { AppState } from "./app";
import { startAppListening } from "./listener";

type State = { app: AppState };

const methods = {
  gemInfo: getGemInfo,
  leagues: getLeagues,
  meta: getMeta,
  gems: getGemOverview,
  currencyMap: getCurrencyOverview,
  templeAverage: getTempleAverage,
  awakenedLevelAverage: getAwakenedLevelAverage,
  awakenedRerollAverage: getAwakenedRerollAverage,
} as const;

type Api = typeof methods;
type ApiRet = { [key in keyof Api]: Awaited<ReturnType<Api[key]>> };

const map = <T extends {}, K extends keyof T>(input: T) => ({
  to: <R extends { [key in K]: any }>(mapping: (key: K, value: T[K]) => any) =>
    Object.fromEntries(Object.entries(input).map((e) => [e[0], mapping(...(e as [K, T[K]]))])) as R,
});

export const apiSlice = createApi({
  baseQuery: async <T extends any[], R>({
    api,
    args,
  }: {
    api: (...args: T) => Promise<R>;
    args: T;
  }) => {
    try {
      return { data: await api(...args) };
    } catch (error) {
      return { error };
    }
  },
  endpoints: (builder) =>
    map(methods).to<{
      [key in keyof Api]: ReturnType<typeof builder.query<ApiRet[key], Parameters<Api[key]>>>;
    }>((key, api) =>
      builder.query<ApiRet[typeof key], Parameters<typeof api>>({
        query: (args) => ({ api, args }),
      })
    ),
});

export type ApiResult<R> =
  | { status: "done"; error?: undefined; value: R }
  | { status: "fail"; error: string; value?: undefined }
  | { status: "idle"; error?: undefined; value?: undefined }
  | { status: "pending"; error?: undefined; value?: undefined };

const toApiResult = <T>({
  data,
  error,
  isSuccess,
  isLoading,
  isUninitialized,
}: {
  data?: T;
  error?: any;
  isSuccess: boolean;
  isLoading: boolean;
  isUninitialized: boolean;
}): ApiResult<T> => {
  if (isUninitialized) {
    return { status: "idle" };
  } else if (isLoading) {
    return { status: "pending" };
  } else if (isSuccess && data) {
    return { status: "done", value: data };
  } else {
    console.error(error);
    return { status: "fail", error: String(error) };
  }
};

const getLeague = ({ app }: State) => app.league;
const getLadder = ({ app }: State) => app.ladder;

const gemInfoSelector = apiSlice.endpoints.gemInfo.select([]);
export const gemInfo = createSelector([gemInfoSelector], toApiResult);
startAppListening({
  predicate: (action, currentState) => gemInfo(currentState).status === "idle",

  effect: async (action, listenerApi) => {
    listenerApi.dispatch(apiSlice.endpoints.gemInfo.initiate([]));
  },
});

const leaguesSelector = apiSlice.endpoints.leagues.select([]);
export const leagues = createSelector([leaguesSelector], toApiResult);
startAppListening({
  predicate: (action, currentState) => leagues(currentState).status === "idle",

  effect: async (action, listenerApi) => {
    listenerApi.dispatch(apiSlice.endpoints.leagues.initiate([]));
  },
});

const metaSelector = createSelector([getLeague, getLadder], (league, ladder) =>
  apiSlice.endpoints.meta.select(league?.indexed ? [league.name, ladder] : skipToken)
);
export const meta = createSelector([(state) => metaSelector(state)(state)], toApiResult);
startAppListening({
  predicate: (action, currentState, previousState) =>
    meta(currentState).status === "idle" ||
    getLeague(currentState) !== getLeague(previousState) ||
    getLadder(currentState) !== getLadder(previousState),

  effect: async (action, listenerApi) => {
    const league = getLeague(listenerApi.getState());
    const ladder = getLadder(listenerApi.getState());
    if (league?.indexed) {
      listenerApi.dispatch(apiSlice.endpoints.meta.initiate([league.name, ladder]));
    }
  },
});

const gemsSelector = createSelector([getLeague], (league) =>
  apiSlice.endpoints.gems.select(league ? [league.name] : skipToken)
);
export const gems = createSelector([(state) => gemsSelector(state)(state)], toApiResult);
startAppListening({
  predicate: (action, currentState, previousState) =>
    gems(currentState).status === "idle" || getLeague(currentState) !== getLeague(previousState),

  effect: async (action, listenerApi) => {
    const league = getLeague(listenerApi.getState());
    if (league) {
      listenerApi.dispatch(apiSlice.endpoints.gems.initiate([league.name]));
    }
  },
});

const currencyMapSelector = createSelector([getLeague], (league) =>
  apiSlice.endpoints.currencyMap.select(league ? [league.name] : skipToken)
);
export const currencyMap = createSelector(
  [(state) => currencyMapSelector(state)(state)],
  toApiResult
);
startAppListening({
  predicate: (action, currentState, previousState) =>
    currencyMap(currentState).status === "idle" ||
    getLeague(currentState) !== getLeague(previousState),

  effect: async (action, listenerApi) => {
    const league = getLeague(listenerApi.getState());
    if (league) {
      listenerApi.dispatch(apiSlice.endpoints.currencyMap.initiate([league.name]));
    }
  },
});

const templeAverageSelector = createSelector([getLeague, currencyMap], (league, currencyMap) =>
  apiSlice.endpoints.templeAverage.select(
    league && currencyMap.status === "done" ? [league.name, currencyMap.value] : skipToken
  )
);
export const templeAverage = createSelector(
  [(state) => templeAverageSelector(state)(state)],
  toApiResult
);
startAppListening({
  predicate: (action, currentState, previousState) =>
    templeAverage(currentState).status === "idle" ||
    getLeague(currentState) !== getLeague(previousState) ||
    currencyMap(currentState) !== currencyMap(previousState),

  effect: async (action, listenerApi) => {
    const league = getLeague(listenerApi.getState());
    const currency = currencyMap(listenerApi.getState());
    if (league && currency.status === "done") {
      listenerApi.dispatch(
        apiSlice.endpoints.templeAverage.initiate([league.name, currency.value])
      );
    }
  },
});

const awakenedLevelAverageSelector = createSelector(
  [getLeague, currencyMap],
  (league, currencyMap) =>
    apiSlice.endpoints.awakenedLevelAverage.select(
      league && currencyMap.status === "done" ? [league?.name, currencyMap.value] : skipToken
    )
);
export const awakenedLevelAverage = createSelector(
  [(state) => awakenedLevelAverageSelector(state)(state)],
  toApiResult
);
startAppListening({
  predicate: (action, currentState, previousState) =>
    awakenedLevelAverage(currentState).status === "idle" ||
    getLeague(currentState) !== getLeague(previousState) ||
    currencyMap(currentState) !== currencyMap(previousState),

  effect: async (action, listenerApi) => {
    const league = getLeague(listenerApi.getState());
    const currency = currencyMap(listenerApi.getState());
    if (league && currency.status === "done") {
      listenerApi.dispatch(
        apiSlice.endpoints.awakenedLevelAverage.initiate([league.name, currency.value])
      );
    }
  },
});

const awakenedRerollAverageSelector = createSelector(
  [getLeague, currencyMap],
  (league, currencyMap) =>
    apiSlice.endpoints.awakenedRerollAverage.select(
      league && currencyMap.status === "done" ? [league?.name, currencyMap.value] : skipToken
    )
);
export const awakenedRerollAverage = createSelector(
  [(state) => awakenedRerollAverageSelector(state)(state)],
  toApiResult
);
startAppListening({
  predicate: (action, currentState, previousState) =>
    awakenedRerollAverage(currentState).status === "idle" ||
    getLeague(currentState) !== getLeague(previousState) ||
    currencyMap(currentState) !== currencyMap(previousState),

  effect: async (action, listenerApi) => {
    const league = getLeague(listenerApi.getState());
    const currency = currencyMap(listenerApi.getState());
    if (league && currency.status === "done") {
      listenerApi.dispatch(
        apiSlice.endpoints.awakenedRerollAverage.initiate([league.name, currency.value])
      );
    }
  },
});
