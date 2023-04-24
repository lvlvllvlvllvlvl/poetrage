import { Language } from "models/ninja/Currency";

export interface ItemBase {
  id?: number;
  name: string;
  itemClass?: number;
  sparkline: Sparkline;
  lowConfidenceSparkline?: Sparkline;
  implicitModifiers?: Modifier[];
  explicitModifiers?: Modifier[];
  chaosValue: number;
  exaltedValue?: number;
  divineValue?: number;
  count?: number;
  detailsId?: string;
  listingCount: number;
  icon?: string;
  flavourText?: string;
  levelRequired?: number;
}
export interface ItemOverview<T extends ItemBase> {
  lines: T[];
  language: Language;
}
export interface SkillGem extends ItemBase {
  variant: string;
  gemLevel: number;
  corrupted?: boolean;
  gemQuality?: number;
}
export interface Sparkline {
  data: Array<number | null>;
  totalChange: number;
}
export interface Modifier {
  text: string;
  optional: boolean;
}
