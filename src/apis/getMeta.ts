import { api } from "apis/axios";
import { Builds } from "models/ninja/Builds";

export const getMeta = async (league: string, type: "exp" | "depthsolo") => {
  const response = await api.get<Builds>(
    `https://poe.ninja/api/data/x/getbuildoverview?overview=${league
      .toLowerCase()
      .replaceAll(" ", "-")}&type=${type}&language=en`,
  );

  const result: { [key: string]: number } = {};
  const total = response.data.accounts.length / 1000;
  response.data.allSkills.forEach(({ name }, i) => {
    result[name] = Math.round(response.data.allSkillUse[i.toString()].length / total) / 10;
  });
  return result;
};
