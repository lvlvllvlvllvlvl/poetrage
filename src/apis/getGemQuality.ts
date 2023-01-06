import { GemType, gemTypes } from "models/Gems";
import { Gem } from "models/repoe/Gem";
import { api } from "./axios";

export const getGemQuality = async () => {
  const response = await api.get<{ [key: string]: Gem }>(
    "https://lvlvllvlvllvlvl.github.io/RePoE/gems.min.json"
  );
  const weights: { [gem: string]: { Type: GemType; weight: number }[] } = {};
  const xp: { [gem: string]: { [level: number]: number } } = {};
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
    Object.entries(gem.per_level).forEach(([level, data]) => {
      if (Number.isInteger(data.experience)) {
        if (!xp[name]) xp[name] = [];
        xp[name][parseInt(level)] = data.experience;
      }
    });
  });
  return { weights, xp };
};
