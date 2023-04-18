import { createSelector } from "@reduxjs/toolkit";
import { currencyMap, gemInfo } from "redux/api";
import { RootState } from "redux/store";
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
