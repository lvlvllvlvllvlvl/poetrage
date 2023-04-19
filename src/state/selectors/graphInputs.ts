import { createSelector } from "@reduxjs/toolkit";
import { currencyMap, gemInfo } from "state/api";
import { RootState } from "state/store";
import { awakenedLevelCost, awakenedRerollCost, templeCost } from "./costs";

export const graphInputs = createSelector(
  [
    (state: RootState) => state.app.data,
    currencyMap,
    ({ app }: RootState) => app.lowConfidence,
    ({ app }: RootState) => app.primeRegrading.debounced,
    ({ app }: RootState) => app.secRegrading.debounced,
    templeCost,
    awakenedLevelCost,
    awakenedRerollCost,
    gemInfo,
  ],
  (
    data,
    currencyMap,
    allowLowConfidence,
    primeRegrading,
    secRegrading,
    templeCost,
    awakenedLevelCost,
    awakenedRerollCost,
    gemInfo
  ) => ({
    data,
    currencyMap,
    allowLowConfidence,
    primeRegrading,
    secRegrading,
    templeCost,
    awakenedLevelCost,
    awakenedRerollCost,
    gemInfo,
  })
);

export type GraphInputs = ReturnType<typeof graphInputs>;
