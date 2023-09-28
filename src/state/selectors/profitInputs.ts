import { createSelector } from "@reduxjs/toolkit";
import { currencyMap, gems, meta } from "state/api";
import { RootState } from "state/store";

export const profitInputs = createSelector(
  [
    gems,
    currencyMap,
    ({ app }: RootState) => app.league?.indexed,
    meta,
    ({ app }: RootState) => app.filterMeta.debounced,
    ({ app }: RootState) => app.overrides,
    ({ app }: RootState) => app.sanitize,
    ({ app }: RootState) => app.lowConfidence,
    ({ app }: RootState) => app.incQual.debounced,
    ({ app }: RootState) => app.mavenExclusiveWeight.debounced,
    ({ app }: RootState) => app.mavenCrucibleWeight.debounced,
  ],
  (
    gems,
    currencyMap,
    leagueIsIndexed,
    meta,
    filterMeta,
    overrides,
    sanitize,
    lowConfidence,
    incQual,
    mavenExclusiveWeight,
    mavenCrucibleWeight
  ) => ({
    gems,
    currencyMap,
    leagueIsIndexed,
    meta,
    filterMeta,
    overrides,
    sanitize,
    lowConfidence,
    incQual,
    mavenExclusiveWeight,
    mavenCrucibleWeight,
  })
);

export type ProfitInputs = ReturnType<typeof profitInputs>;
