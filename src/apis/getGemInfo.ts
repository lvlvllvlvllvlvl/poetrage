import { api } from "apis/axios";
import { Gem } from "models/repoe/Gem";

export interface Stats {
  [gem: string]: { stat?: string; stats: { [id: string]: number } };
}
export interface XP {
  [gem: string]: { [level: number]: number };
}
export interface Transfiguration {
  [base: string]: { [discriminator: string]: string };
}
export interface TransfigBase {
  [name: string]: { baseName: string; discriminator: string };
}

export type GemInfo = Awaited<ReturnType<typeof getGemInfo>>;

const regex = /{[^/]\/?([^}]*)}/g;
const quants: string[] = [];
export const getGemInfo = async () => {
  const response = await api.get<{ [key: string]: Gem }>(
    "https://lvlvllvlvllvlvl.github.io/RePoE/gems.min.json",
  );
  const qualityStats: Stats = {};
  const xp: XP = {};
  const maxLevel: { [gem: string]: number } = {};
  const transfigurations: Transfiguration = {};
  const transfigureBases: TransfigBase = {};
  const color: { [gem: string]: "r" | "g" | "b" | "w" } = {};
  const transByColor: { [color in "r" | "g" | "b" | "w"]: string[] } = {
    r: [],
    b: [],
    g: [],
    w: [],
  };
  Object.values(response.data).forEach((gem) => {
    const name = gem.display_name || gem.base_item?.display_name;
    if (!name || !gem.base_item || gem.base_item.id.includes("Royale")) {
      return;
    }
    if (gem.discriminator) {
      const baseName = gem.base_item.display_name;
      transfigureBases[name] = { baseName, discriminator: gem.discriminator };
      transfigurations[baseName] = transfigurations[baseName] || {};
      transfigurations[baseName][gem.discriminator] = name;
      transByColor[gem.color].push(name);
    }
    color[name] = gem.color;
    if (gem.base_item.max_level) maxLevel[name] = gem.base_item.max_level;
    qualityStats[name] = qualityStats[name] || gem.static.quality_stats.find(({ stat }) => stat);
    gem.static.quality_stats.forEach((quality_stat) => {
      if (quality_stat.stat) {
        for (const [, quant] of Array.from(quality_stat.stat.matchAll(regex))) {
          if (quant && !quants.includes(quant)) {
            quants.push(quant);
          }
        }
      }
    });
    Object.entries(gem.per_level).forEach(([level, data]) => {
      if (Number.isInteger(data.experience)) {
        if (!xp[name]) xp[name] = [];
        xp[name][parseInt(level)] = data.experience;
      }
    });
  });
  return { qualityStats, xp, maxLevel, color, transfigurations, transfigureBases, transByColor };
};
