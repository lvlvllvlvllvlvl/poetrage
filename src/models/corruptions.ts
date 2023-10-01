import { SearchQuery } from "./poe/Search";

export interface UniqueProfits {
  [unique: string]: {
    cost: number;
    profit: number;
    outcomes: {
      [stat: string]: {
        profit: number;
        chance: number;
        ev: number;
        listings?: number;
        query?: SearchQuery;
      };
    };
  };
}
