import { createSelector } from "@reduxjs/toolkit";
import { Mod } from "models/repoe/Mod";
import { Unique } from "models/repoe/Uniques";
import { mods, translations, uniques } from "state/api";

export const weightInputs = createSelector(
  [mods, uniques, translations],
  (mods, uniques, translations) => ({ mods, uniques, translations })
);

export type WeightInputs = ReturnType<typeof weightInputs>;

export interface WeightClass {
  variants: Unique[];
  sumWeight: number;
  stats: {
    [stat: string]: { [modId: string]: Mod & { id: string; weight: number; stat: string } };
  };
}
