import { GemDetails, getId } from "../models/gems";
import { NodeMap } from "../models/graphElements";
import { buildGraph } from "../state/workers/buildGraph";
import { calculateProfits } from "../state/workers/calculateProfits";
import leveledSparkGraph from "./data/20-0-spark-graph.json";
import leveledSpark from "./data/20-0-spark.json";
import extracted from "./data/extractedData.json";
import graphInputs from "./data/graphInputs.json";
import profitInputs from "./data/profitInputs.json";

const extractData = (gem: GemDetails) => {
  const data = [gem.original];
  gem.xpData?.forEach(({ original }) => data.push(original));
  gem.gcpData?.forEach(({ original }) => data.push(original));
  gem.levelData?.forEach(({ original }) => data.push(original));
  gem.vaalData?.forEach(({ gem: { original } }) => data.push(original));
  gem.templeData?.forEach(({ gem: { original } }) => data.push(original));
  return data;
};

it("extracts data from paste", () => {
  const data = extractData(leveledSpark as any);

  // console.log(JSON.stringify(data));
  expect(data).toEqual(extracted);
});

it("calculates simple outputs", async () => {
  const profits = await calculateProfits({
    ...profitInputs,
    gems: { ...profitInputs.gems, value: { source: "ninja", data: extracted } },
  } as any);

  const gem = profits?.find((g) => getId(g) === "20/20 clean Spark")!;

  expect(gem.xpValue).toBeCloseTo(0);
  expect(gem.vaalValue).toBeCloseTo(-2.91);
  expect(gem.templeValue).toBeCloseTo(-0.92);
});

it("calculates graph outputs", async () => {
  const graph: NodeMap = await buildGraph({
    ...graphInputs,
    data: await calculateProfits({
      ...profitInputs,
      gems: {
        ...profitInputs.gems,
        value: { source: "ninja", data: extractData(leveledSpark as any) },
      },
    } as any),
  } as any);
  const id = getId(leveledSpark as any);

  //console.log(JSON.stringify(graph[id]));
  expect(graph[id]).toEqual(leveledSparkGraph);
});
