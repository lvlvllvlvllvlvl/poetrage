import { GemDetails } from "models/gems";
import paste from "./data/pastedData.json";
import extracted from "./data/extractedData.json";
import inputs from "./data/profitInputs.json";
import outputs from "./data/profitOutputs.json";
import { calculateProfits } from "workers/calculateProfits";

it("extracts data from paste", () => {
  const gem = paste as GemDetails;
  const data = [gem.original];
  gem.xpData?.forEach(({ original }) => data.push(original));
  gem.gcpData?.forEach(({ original }) => data.push(original));
  gem.levelData?.forEach(({ original }) => data.push(original));
  gem.regrData?.forEach(({ gem: { original } }) => data.push(original));
  gem.vaalData?.forEach(({ gem: { original } }) => data.push(original));
  gem.templeData?.forEach(({ gem: { original } }) => data.push(original));
  expect(data).toEqual(extracted);
});

it("reproduces the data from the inputs", () => {
  const result = calculateProfits({ inputs } as any);
  expect(result).toEqual(outputs);
});
