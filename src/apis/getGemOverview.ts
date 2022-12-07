import { ItemOverview, SkillGem } from "../models/ninja/Item";
import { api } from "./axios";

export const getGemOverview = async (league: string) => {
  const response = await api.get<ItemOverview<SkillGem>>(
    `https://poe.ninja/api/data/itemoverview?league=${league}&type=SkillGem`
  );
  return response.data.lines.map(
    ({ name, variant, chaosValue, gemLevel, gemQuality, corrupted, listingCount, sparkline }) => ({
      name,
      variant,
      chaosValue,
      gemLevel,
      gemQuality,
      corrupted,
      listingCount,
      sparkline,
    })
  );
};
