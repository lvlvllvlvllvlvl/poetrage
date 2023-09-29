import { createSelector } from "@reduxjs/toolkit";
import { currencyMap } from "state/api";
import { RootState } from "state/store";
import { awakenedLevelCost, awakenedRerollCost, templeCost } from "./costs";

export const graphInputs = createSelector(
  [
    (state: RootState) => state.app.data,
    currencyMap,
    ({ app }: RootState) => app.lowConfidence,
    ({ app }: RootState) => app.primeRegrading.debounced,
    ({ app }: RootState) => app.secRegrading.debounced,
    ({ app }: RootState) => app.incQual.debounced,
    templeCost,
    awakenedLevelCost,
    awakenedRerollCost,
  ],
  (
    data,
    currencyMap,
    allowLowConfidence,
    primeRegrading,
    secRegrading,
    incQual,
    templeCost,
    awakenedLevelCost,
    awakenedRerollCost,
  ) => ({
    data,
    currencyMap,
    allowLowConfidence,
    primeRegrading,
    secRegrading,
    incQual,
    templeCost,
    awakenedLevelCost,
    awakenedRerollCost,
  }),
);

export type GraphInputs = ReturnType<typeof graphInputs>;
