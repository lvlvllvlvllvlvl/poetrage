import { CurrencyOverview } from "../models/ninja/Currency";
import { api } from "./axios";

export const getCurrencyOverview = async (league: string) => {
  const response = await api.get<CurrencyOverview>(
    `https://poe.ninja/api/data/currencyoverview?league=${league}&type=Currency`
  );

  const result: { [key: string]: number } = { chaos: 1 };
  response.data.lines.forEach((c) => (result[c.currencyTypeName] = c.chaosEquivalent));
  result["exalted"] = result["Exalted Orb"];
  return result;
};
