import { createSelector } from "@reduxjs/toolkit";
import { currencyMap, gemInfo, gems, meta } from "redux/api";
import { RootState } from "redux/store";

export const getInputs = createSelector(
  [
    gems,
    currencyMap,
    ({ app }: RootState) => app.league?.indexed,
    meta,
    gemInfo,
    ({ app }: RootState) => app.filterMeta.debounced,
    ({ app }: RootState) => app.overrides,
    ({ app }: RootState) => app.sanitize,
    ({ app }: RootState) => app.lowConfidence,
    ({ app }: RootState) => app.incQual.debounced,
    ({ app }: RootState) => app.mavenExclusiveWeight.debounced,
    ({ app }: RootState) => app.mavenCrucibleWeight.debounced,
  ],
  (...args) => args
);

export type ProfitInputs = ReturnType<typeof getInputs>;
