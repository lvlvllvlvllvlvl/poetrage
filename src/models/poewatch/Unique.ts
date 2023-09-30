export interface UniquePricing {
  id: number;
  name: string;
  category: string;
  group: Group;
  frame: number;
  influences: string;
  icon: string;
  mean: number;
  min: number;
  max: number;
  exalted: number;
  daily: number;
  change: number;
  history: number[];
  lowConfidence: boolean;
  implicits: string[] | null;
  explicits: string[] | null;
  itemLevel: number;
  width: number;
  height: number;
  divine: number;
  linkCount: number;
  perfectPrice?: number;
  perfectAmount?: number;
}

export type Group =
  | "onehandaxes"
  | "bows"
  | "twohandaxes"
  | "rapiers"
  | "onehandswords"
  | "wands"
  | "daggers"
  | "staves"
  | "scepters"
  | "claws"
  | "bow"
  | "twohandswords"
  | "onehandmaces"
  | "twohandmaces"
  | "staff"
  | "onesword"
  | "warstaff"
  | "fishingrods"
  | "wand"
  | "twosword"
  | "sceptre";

export interface CorruptedMod {
  name: string;
  mean: number;
}
