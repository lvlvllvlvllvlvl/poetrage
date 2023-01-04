import { GemType, gemTypes } from "models/Gems";
import { api } from "./axios";

export const getGemQuality = async () => {
  const weights: { [key: string]: { Type: GemType; weight: number }[] } = {};
  let offset = 0;
  let json: { cargoquery: { title: { name: string; "set id": string; weight: string } }[] } = {
    cargoquery: [],
  };
  do {
    offset += json?.cargoquery?.length || 0;
    json = (
      await api.get(
        "https://www.poewiki.net/w/api.php?action=cargoquery&tables=items,skill_quality&join_on=items._pageID=skill_quality._pageID&fields=items.name,skill_quality.set_id,skill_quality.weight&order_by=items.name,skill_quality.set_id&where=skill_quality.set_id%20IS%20NOT%20NULL&format=json&limit=500&offset=" +
          offset
      )
    ).data;
    json?.cargoquery?.forEach(({ title: { name, "set id": set, weight } }) => {
      weights[name] = weights[name] || [];
      const Type = gemTypes[parseInt(set)];
      if (!weights[name].find((w) => w.Type === Type)) {
        weights[name].push({ Type, weight: parseInt(weight) });
      }
    });
  } while (json?.cargoquery && json?.cargoquery.length);
  return { weights };
};
