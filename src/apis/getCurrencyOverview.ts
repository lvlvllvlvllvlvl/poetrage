import { api } from "./axios";
import { CurrencyOverview } from "../models/ninja/Currency";

export const getCurrencyOverview = async (league: string) => {
  const response = await api.get<CurrencyOverview>(
    `https://poe.ninja/api/data/currencyoverview?league=${league}&type=Currency`
  );

  const result: { [key: string]: number } = { chaos: 1 };
  response.data.lines.forEach((c) => (result[c.currencyTypeName] = c.chaosEquivalent));
  return result;
};
