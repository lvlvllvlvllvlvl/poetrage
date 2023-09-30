import { createSelector } from "@reduxjs/toolkit";
import { Mod } from "models/repoe/Mod";
import { Unique } from "models/repoe/Uniques";
import { RootState } from "state/store";

export interface WeightInfo {
  sumWeight: number;
  mods: { [mod: string]: number };
}

export interface ModDetails
  extends Pick<Mod, "type" | "required_level" | "groups" | "spawn_weights" | "stats"> {
  weight: number;
  stat: { formatted: string };
}

export interface ModInfo {
  uniques: {
    [name: string]: Pick<Unique, "tags" | "page_name">[];
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
    ({ app }: RootState) => app.league,
    ({ app }: RootState) => app.source,
    ({ app }: RootState) => app.tab,
  ],
  (league, source, tab) => ({
    league,
    source,
    tab,
  }),
);

export type ModInputs = ReturnType<typeof modInputs>;
