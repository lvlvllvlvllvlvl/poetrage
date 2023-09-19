import { ItemOverview, SkillGem } from "models/ninja/Item";
import { api } from "apis/axios";
import { GemResult } from "models/poewatch/Gem";

export const getGemOverview = async (league: string, source: "ninja" | "watch") => {
  if (source === "ninja") {
    const response = await api.get<ItemOverview<SkillGem>>(
      `https://poe.ninja/api/data/itemoverview?league=${league}&type=SkillGem`
    );
    return {
      source,
      data: response.data.lines.map(
        ({ name, variant, chaosValue, gemLevel, gemQuality, corrupted, listingCount, sparkline }) =>
          ({
            name,
            variant,
            chaosValue,
            gemLevel,
            gemQuality,
            corrupted,
            listingCount,
            sparkline,
          } as SkillGem)
      ),
    };
  } else {
    const { data } = await api.get<GemResult>(
      `https://api.poe.watch/get?category=gem&league=${league}`
    );
    return { source, data };
  }
};
