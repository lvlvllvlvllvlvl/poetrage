import { GemType, gemTypes } from "models/Gems";
import { Gem } from "models/repoe/Gem";
import { api } from "./axios";

export const getGemQuality = async () => {
  const response = await api.get<{ [key: string]: Gem }>(
    "https://raw.githubusercontent.com/brather1ng/RePoE/master/RePoE/data/gems.json"
  );
  const weights: { [key: string]: { Type: GemType; weight: number }[] } = {};
  Object.values(response.data).forEach((gem) => {
    const name = gem.base_item?.display_name;
    if (!name) {
      return;
    }
    weights[name] = weights[name] || [];
    gem.static.quality_stats.forEach(({ set, weight }) => {
      const Type = gemTypes[set];
      if (!weights[name].find((w) => w.Type === Type)) {
        weights[name].push({ Type, weight });
      }
    });
  });
  return { weights };
};
