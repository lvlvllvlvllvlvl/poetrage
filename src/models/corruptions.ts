export interface UniqueProfits {
  [unique: string]: {
    cost: number;
    profit: number;
    outcomes: { [stat: string]: { profit: number; chance: number; ev: number } };
  };
}
