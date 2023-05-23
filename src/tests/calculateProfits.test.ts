import { GemDetails, getId } from "../models/gems";
import { NodeMap } from "../models/graphElements";
import { buildGraph } from "../workers/buildGraph";
import { calculateProfits } from "../workers/calculateProfits";
import leveledSparkGraph from "./data/20-0-spark-graph.json";
import leveledSpark from "./data/20-0-spark.json";
import divergentSpark from "./data/20-20-div-spark.json";
import extracted from "./data/extractedData.json";
import graphInputs from "./data/graphInputs.json";
import profitInputs from "./data/profitInputs.json";

const extractData = (gem: GemDetails) => {
  const data = [gem.original];
  gem.xpData?.forEach(({ original }) => data.push(original));
  gem.gcpData?.forEach(({ original }) => data.push(original));
  gem.levelData?.forEach(({ original }) => data.push(original));
  gem.regrData?.forEach(({ gem: { original } }) => data.push(original));
  gem.vaalData?.forEach(({ gem: { original } }) => data.push(original));
  gem.templeData?.forEach(({ gem: { original } }) => data.push(original));
  return data;
};

it("extracts data from paste", () => {
  const data = extractData(divergentSpark as any);

  // console.log(JSON.stringify(data));
  expect(data).toEqual(extracted);
});

it("calculates simple outputs", () => {
  const profits = calculateProfits({
    inputs: {
      ...profitInputs,
      gems: { ...profitInputs.gems, value: { source: "ninja", data: extracted } },
    },
  } as any);
  const id = getId(divergentSpark as any);

  const gem = profits?.find((g) => getId(g) === id)!;

  expect(gem.xpValue).toBeCloseTo(divergentSpark.xpValue);
  expect(gem.vaalValue).toBeCloseTo(divergentSpark.vaalValue);
  expect(gem.templeValue).toBeCloseTo(divergentSpark.templeValue);
  expect(gem.regrValue).toBeCloseTo(divergentSpark.regrValue);
});

it("calculates graph outputs", () => {
  const graph: NodeMap = buildGraph({
    inputs: {
      ...graphInputs,
      data: calculateProfits({
        inputs: {
          ...profitInputs,
          gems: {
            ...profitInputs.gems,
            value: { source: "ninja", data: extractData(leveledSpark as any) },
          },
        },
      } as any),
    },
  } as any);
  const id = getId(leveledSpark as any);

  console.log(JSON.stringify(graph[id]));
  expect(graph[id]).toEqual(leveledSparkGraph);
});
