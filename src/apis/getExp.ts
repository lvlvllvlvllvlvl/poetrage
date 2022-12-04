import axios from "axios";

const levelRange = Array.from(Array(41).keys());
const toInt = (n: string) => parseInt(n);
export const getExp = async () => {
  let offset = 0;
  let result: { [key: string]: { [key: number]: number } } = {};
  let json: any;
  do {
    json = (
      await axios.get(
        "http://localhost:8080/wiki/w/api.php?action=cargoquery&tables=items,skill_levels&group_by=items._pageID&join_on=items._pageID=skill_levels._pageID&fields=items.name,GROUP_CONCAT(skill_levels.level),GROUP_CONCAT(skill_levels.experience)&order_by=level&where=skill_levels.experience%20IS%20NOT%20NULL&format=json&limit=500&offset=" +
          offset
      )
    ).data;
    json?.cargoquery?.forEach(
      ({
        title: { name, "level)": levelData, "experience)": xpData },
      }: {
        title: { [key: string]: string };
      }) => {
        const level = levelData?.split(",")?.map(toInt) || [];
        const xp = xpData?.split(",")?.map(toInt) || [];
        const levels: { [key: number]: number } = {};
        levelRange.forEach((l) => {
          levels[l] = xp[level.indexOf(l)];
        });
        result[name] = levels;
      }
    );
    offset += 500;
  } while (json?.cargoquery && json?.cargoquery.length && Object.keys(result).length === offset);
  return result;
};
