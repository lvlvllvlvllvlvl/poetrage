import { createSelector } from "@reduxjs/toolkit";
import { awakenedLevelAverage, awakenedRerollAverage, templeAverage } from "state/api";
import { RootState } from "state/store";

export const templeCost = createSelector(
  [({ app: { templePrice } }: RootState) => templePrice, templeAverage],
  (templePrice, templeAverage) =>
    templePrice.debounced || (templeAverage.status === "done" && templeAverage.value.price) || 100,
);
export const awakenedLevelCost = createSelector(
  [({ app: { awakenedLevelPrice } }: RootState) => awakenedLevelPrice, awakenedLevelAverage],
  (awakenedLevelPrice, awakenedLevelAverage) =>
    awakenedLevelPrice.debounced ||
    (awakenedLevelAverage.status === "done" && awakenedLevelAverage.value.price) ||
    30,
);
export const awakenedRerollCost = createSelector(
  [({ app: { awakenedRerollPrice } }: RootState) => awakenedRerollPrice, awakenedRerollAverage],
  (awakenedRerollPrice, awakenedRerollAverage) =>
    awakenedRerollPrice.debounced ||
    (awakenedRerollAverage.status === "done" && awakenedRerollAverage.value.price) ||
    250,
);
