import { api } from "apis/axios";
import { GemType, QualityType } from "models/gems";
import { Gem } from "models/repoe/Gem";

export type Weights = { [gem: string]: { Type: GemType; weight: number }[] };
export type Stats = {
  [gem: string]: { [quality in QualityType]?: { id: string; stat?: string; value: number }[] };
};
export type XP = { [gem: string]: { [level: number]: number } };

export type GemInfo = Awaited<ReturnType<typeof getGemInfo>>;

const regex = /{[^/]\/?([^}]*)}/g;
const quants: string[] = [];
export const getGemInfo = async () => {
  const response = await api.get<{ [key: string]: Gem }>(
    "https://lvlvllvlvllvlvl.github.io/RePoE/gems.min.json"
  );
  const weights: Weights = {};
  const qualityStats: Stats = {};
  const xp: XP = {};
  const names = new Set<string>();
  const maxLevel: { [gem: string]: number } = {};
  Object.values(response.data).forEach((gem) => {
    const name = gem.base_item?.display_name;
    if (!name || gem.base_item.id.includes("Royale")) {
      return;
    }
    names.add(name);
    if (gem.base_item.max_level) maxLevel[name] = gem.base_item.max_level;
    weights[name] = weights[name] || [];
    qualityStats[name] = qualityStats[name] || [];
    gem.static.quality_stats.forEach((quality_stat) => {
      if (quality_stat.stat) {
        for (const [, quant] of Array.from(quality_stat.stat.matchAll(regex))) {
          if (quant && !quants.includes(quant)) {
            quants.push(quant);
          }
        }
      }
      (qualityStats[name][quality_stat.set_name] =
        qualityStats[name][quality_stat.set_name] || []).push({
        id: quality_stat.id,
        stat: quality_stat.stat,
        value: quality_stat.value,
      });
      if (!weights[name].find((w) => w.Type === quality_stat.set_name)) {
        weights[name].push({ Type: quality_stat.set_name, weight: quality_stat.weight });
      }
    });
    Object.entries(gem.per_level).forEach(([level, data]) => {
      if (Number.isInteger(data.experience)) {
        if (!xp[name]) xp[name] = [];
        xp[name][parseInt(level)] = data.experience;
      }
    });
  });
  return { weights, qualityStats, xp, maxLevel, names: Array.from(names).sort() };
};
