import { CurrencyOverview } from "../models/ninja/Currency";
import { api } from "./axios";

export const getCurrencyOverview = async (league: string) => {
  const response = await api.get<CurrencyOverview>(
    `https://poe.ninja/api/data/currencyoverview?league=${league}&type=Currency`
  );

  const result: { [key: string]: number } = {};
  response.data.lines.forEach((c) => (result[c.currencyTypeName] = c.chaosEquivalent));
  result["exalted"] = result["Exalted Orb"];
  result["divine"] = result["Divine Orb"];
  result["chaos"] = result["Chaos Orb"];
  function getter(currency: string) {
    return (
      result[currency] ||
      result[
        Object.keys(result)
          .filter((k) => k.toLowerCase().includes(currency))
          .reduce((a, b) => (!a ? b : !b ? a : a.length <= b.length ? a : b), "") || ""
      ] ||
      1
    );
  }
  return getter;
};
