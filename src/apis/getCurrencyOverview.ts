import { CurrencyOverview } from "models/ninja/Currency";
import { api } from "apis/axios";

export const getCurrencyOverview = async (league: string) => {
  const response = await api.get<CurrencyOverview>(
    `https://poe.ninja/api/data/currencyoverview?league=${league}&type=Currency`
  );

  const result: { [key: string]: number } = {};
  response.data.lines.forEach((c) => (result[c.currencyTypeName] = c.chaosEquivalent));
  result["exalted"] = result["Exalted Orb"];
  result["divine"] = result["Divine Orb"];
  result["chaos"] = result["Chaos Orb"];
  return result;
};

export const getCurrency = (currency: string, map?: { [key: string]: number }, fallback = 1) => {
  return (
    map?.[currency] ||
    map?.[
      Object.keys(map)
        .filter((k) => k.toLowerCase().includes(currency))
        .reduce((a, b) => (!a ? b : !b ? a : a.length <= b.length ? a : b), "") || ""
    ] ||
    fallback
  );
};
