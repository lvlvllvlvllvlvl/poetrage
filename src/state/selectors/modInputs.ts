import { createSelector } from "@reduxjs/toolkit";
import { SearchQuery } from "models/poe/Search";
import { Mod } from "models/repoe/Mod";
import { RootState } from "state/store";

export interface WeightInfo {
  sumWeight: number;
  mods: { [mod: string]: number };
}

export interface ModDetails
  extends Pick<Mod, "type" | "required_level" | "groups" | "spawn_weights" | "stats"> {
  weight: number;
  stat: { formatted: string; trade_stat: string[] };
}

export interface ModInfo {
  uniques: {
    [name: string]: { tags: string; page_name: string; query: SearchQuery }[];
  };
  weights: {
    [tagset: string]: WeightInfo;
  };
  mods: {
    [placeholder: string]: { [mod_id: string]: ModDetails };
  };
}

export const modInputs = createSelector(
  [
    ({ app }: RootState) => app.load,
    ({ app }: RootState) => app.league,
    ({ app }: RootState) => app.source,
    ({ app }: RootState) => app.tab,
  ],
  (load, league, source, tab) => ({
    load,
    league,
    source,
    tab,
  }),
);

export type ModInputs = ReturnType<typeof modInputs>;
