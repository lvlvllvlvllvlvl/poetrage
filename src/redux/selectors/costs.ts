import { createSelector } from "@reduxjs/toolkit";
import { getCurrency } from "functions/getCurrency";
import { GemDetails } from "models/gems";
import { awakenedLevelAverage, awakenedRerollAverage, currencyMap, templeAverage } from "redux/api";
import { RootState } from "redux/store";

export const templeCost = createSelector(
  [({ app: { templePrice } }: RootState) => templePrice, templeAverage],
  (templePrice, templeAverage) =>
    templePrice.debounced || (templeAverage.status === "done" && templeAverage.value.price) || 100
);
export const awakenedLevelCost = createSelector(
  [({ app: { awakenedLevelPrice } }: RootState) => awakenedLevelPrice, awakenedLevelAverage],
  (awakenedLevelPrice, awakenedLevelAverage) =>
    awakenedLevelPrice.debounced ||
    (awakenedLevelAverage.status === "done" && awakenedLevelAverage.value.price) ||
    30
);
export const awakenedRerollCost = createSelector(
  [({ app: { awakenedRerollPrice } }: RootState) => awakenedRerollPrice, awakenedRerollAverage],
  (awakenedRerollPrice, awakenedRerollAverage) =>
    awakenedRerollPrice.debounced ||
    (awakenedRerollAverage.status === "done" && awakenedRerollAverage.value.price) ||
    250
);
export const regradeValue = createSelector(
  [
    currencyMap,
    ({ app }: RootState) => app.primeRegrading.debounced,
    ({ app }: RootState) => app.secRegrading.debounced,
  ],
  (currencyMap, primeRegrading, secRegrading) =>
    ({ regrValue, Name }: GemDetails) =>
      (regrValue || 0) -
      (Name.includes("Support")
        ? secRegrading || getCurrency("Secondary Regrading Lens", currencyMap.value, 0)
        : primeRegrading || getCurrency("Prime Regrading Lens", currencyMap.value, 0))
);
