import { api } from "apis/axios";
import { GemType, gemTypes } from "models/Gems";
import { Gem } from "models/repoe/Gem";

export type Weights = { [gem: string]: { Type: GemType; weight: number }[] };
export type XP = { [gem: string]: { [level: number]: number } };

export type GemInfo = {
  weights: Weights;
  xp: XP;
  names: string[];
};

export const getGemQuality = async () => {
  const response = await api.get<{ [key: string]: Gem }>(
    "https://lvlvllvlvllvlvl.github.io/RePoE/gems.min.json"
  );
  const weights: Weights = {};
  const xp: XP = {};
  const names = new Set<string>();
  Object.values(response.data).forEach((gem) => {
    const name = gem.base_item?.display_name;
    if (!name) {
      return;
    }
    names.add(name);
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
  return { weights, xp, names: Array.from(names).sort() };
};
