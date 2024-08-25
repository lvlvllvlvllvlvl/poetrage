import { fromBinary } from "@bufbuild/protobuf";
import { api } from "apis/axios";
import { Leagues } from "models/ninja/Leagues";
import {
  NinjaSearchResultSchema,
  SearchResultDictionarySchema,
} from "models/ninja/protobuf/ninja_pb";

export const getMeta = async (league: string, type: "exp" | "depthsolo", leagues: Leagues) => {
  const { url, version } = leagues.snapshotVersions.find(
    (v) => v.name === league && v.type === type,
  )!;
  const response = await api.get<ArrayBuffer>(
    `https://poe.ninja/api/builds/search/${version}?overview=${url}&type=${type}&language=en`,
    { responseType: "arraybuffer" },
  );
  const data = fromBinary(NinjaSearchResultSchema, new Uint8Array(response.data)).result!;
  const allSkills = data.dimensions.find((d) => d.id === "allskills")!;
  const hash = data.dictionaries.find((d) => d.id === allSkills.dictionaryId)!.hash;
  const dictResp = await api.get<ArrayBuffer>(
    `https://poe.ninja/api/builds/search/dictionary/${hash}`,
    {
      responseType: "arraybuffer",
    },
  );
  const dict = fromBinary(SearchResultDictionarySchema, new Uint8Array(dictResp.data))!;

  const result: { [key: string]: number } = {};
  allSkills.counts.forEach(({ key = 0, count }) => {
    result[dict.values[key]] = (count * 100) / data.total;
  });
  return result;
};
