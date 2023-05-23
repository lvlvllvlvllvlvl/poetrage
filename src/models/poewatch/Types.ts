export type GemResult = Gem[];

export interface Gem {
  id: number;
  name: string;
  category: string;
  group: string;
  frame: number;
  icon: string;
  mean: number;
  min: number;
  max: number;
  exalted: number;
  daily: number;
  change: number;
  history: number[];
  lowConfidence: boolean;
  itemLevel: number;
  width: number;
  height: number;
  divine: number;
  gemLevel: number;
  gemQuality: number;
  gemIsCorrupted: boolean;
}
