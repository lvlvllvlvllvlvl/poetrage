import { GemDetails, getId } from "models/gems";
import { calculateProfits } from "workers/calculateProfits";
import extracted from "./data/extractedData.json";
import paste from "./data/pastedData.json";
import inputs from "./data/profitInputs.json";

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
  const result = calculateProfits({
    inputs: { ...inputs, gems: { ...inputs.gems, value: extracted } },
  } as any);
  const id = getId(paste);

  expect(result.find((gem) => getId(gem) === id)).toEqual(paste);
});
