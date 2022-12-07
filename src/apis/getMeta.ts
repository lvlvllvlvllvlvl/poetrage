import { Builds } from "../models/ninja/Builds";
import { api } from "./axios";

export const getMeta = async (league: string) => {
  const response = await api.get<Builds>(
    `https://poe.ninja/api/data/x/getbuildoverview?overview=${league
      .toLowerCase()
      .replaceAll(" ", "-")}&type=exp&language=en`
  );

  const result: { [key: string]: number } = {};
  const total = response.data.accounts.length / 1000;
  response.data.allSkills.forEach(({ name }, i) => {
    result[name] = Math.round(response.data.allSkillUse[i.toString()].length / total) / 10;
  });
  return result;
};
