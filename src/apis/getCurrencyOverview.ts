import { CurrencyOverview } from "models/ninja/Currency";
import { api } from "apis/axios";

export const getCurrencyOverview = async (league: string) => {
  const response = await api.get<CurrencyOverview>(
    `https://poe.ninja/api/data/currencyoverview?league=${league}&type=Currency`
  );

  const result: { [key: string]: number } = {};
  response.data.lines.forEach((c) => {
    result[c.currencyTypeName] = c.chaosEquivalent;
  });
  response.data.currencyDetails.forEach((c) => {
    if (c.tradeId) {
      result[c.tradeId] = result[c.name];
    }
  });
  return result;
};
