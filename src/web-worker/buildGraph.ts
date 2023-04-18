/* eslint-disable no-restricted-globals */
import { getCurrency } from "functions/getCurrency";
import { memoize } from "lodash";
import {
  ConversionData,
  Gem,
  GemDetails,
  GemId,
  GemType,
  getId,
  qualities,
  qualityIndex,
} from "models/gems";
import { GraphChild, GraphNode, NodeMap } from "models/graphElements";
import { GraphInputs } from "redux/selectors/graphInputs";

self.onmessage = (e: MessageEvent<{ inputs: GraphInputs; cancel: URL }>) => {
  try {
    const {
      data,
      currencyMap,
      allowLowConfidence,
      primeRegrading,
      secRegrading,
      templeCost,
      awakenedLevelCost,
      awakenedRerollCost,
      gemInfo,
    } = e.data.inputs;

    const checkToken = () => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", e.data.cancel, false);
      xhr.send(null);
    };
    const setData = (payload: { [key: GemId]: GraphNode }) => {
      checkToken();
      self.postMessage({ action: "data", payload });
    };
    let counter = 0;
    const setProgress = (payload: number) => {
      if (counter++ % 10 === 0) {
        checkToken();
      }
      self.postMessage({ action: "progress", payload });
    };
    const setProgressMsg = (payload: string) => self.postMessage({ action: "msg", payload });
    const done = () => self.postMessage({ action: "done" });

    const map: { [k: GemId]: GemDetails } = {};
    data.forEach((gem) => (map[getId(gem)] = gem));
    const gemMap = (gem: Gem) => map[getId(gem)] || gem;

    const regradeValue = ({ regrValue, Name }: GemDetails) =>
      (regrValue || 0) -
      (Name.includes("Support")
        ? secRegrading || getCurrency("Secondary Regrading Lens", currencyMap.value, 0)
        : primeRegrading || getCurrency("Prime Regrading Lens", currencyMap.value, 0));

    const fn = (gem: GemDetails): GraphNode => {
      const gcpBest =
        gem.gcpData && max(gem.gcpData.map(normalizedFn) || [], (v) => v.expectedValue);

      const action = max(
        [
          [
            "gcp",
            gcpBest?.expectedValue
              ? gcpBest.expectedValue -
                (gcpBest.gem.Quality - gem.Quality) *
                  getCurrency("Gemcutter's Prism", currencyMap.value)
              : 0,
          ],
          ["vaal", (gem.vaalValue || 0) - getCurrency("Vaal Orb", currencyMap.value)],
          ["temple", (gem.templeValue || 0) - templeCost],
          [
            "level",
            (max((gem.levelData || []).map(normalizedFn), (d) => d.expectedValue)?.expectedValue ||
              0) - awakenedLevelCost,
          ],
          ["reroll", (gem.convertValue || 0) - awakenedRerollCost],
          ["sell", allowLowConfidence || !gem.lowConfidence ? gem.Price : 0],
        ] as const,
        (v) => v[1] || 0
      );

      if (!action || action[1] <= 0) {
        return createUnknown(gem);
      }
      switch (action[0]) {
        case "gcp":
          return createNode(gem, action[1], [
            { name: "Gemcutter's Prism", probability: 1, node: gcpBest },
          ]);
        case "vaal":
          return createNode(
            gem,
            action[1],
            gem.vaalData!.map((v) => ({
              name: v.outcomes[0],
              probability: v.chance,
              node: normalizedFn(v.gem),
            }))
          );
        case "temple":
          return createNode(
            gem,
            action[1],
            gem.templeData!.map((v) => ({
              name: v.outcomes[0],
              probability: v.chance,
              node: normalizedFn(v.gem),
            }))
          );
        case "level":
          return createNode(gem, action[1], [
            {
              name: "Wild Brambleback",
              probability: 1,
              node: max((gem.levelData || []).map(normalizedFn), (d) => d.expectedValue),
            },
          ]);
        case "reroll":
          return createNode(gem, action[1], [{ name: "Vivid Watcher", probability: 1 }]);
        case "sell":
          return createNode(gem, allowLowConfidence || !gem.lowConfidence ? action[1] : gem.Price, [
            {
              name: allowLowConfidence || !gem.lowConfidence ? "Sell" : "Sell (low confidence)",
              probability: 1,
            },
          ]);
      }
    };

    const memoizedFn = memoize(fn, (gem) => gem);
    const normalizedFn = (gem: Gem) => memoizedFn(gemMap(gem));
    const processingTime = 400;

    setProgressMsg("Calculating profit flowcharts excluding loops");
    setProgress(0);
    let timeSlice = Date.now() + processingTime;

    const graphData: NodeMap = {};
    let i = 0;
    for (const gem of data) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / data.length;
        setProgress(p);
        timeSlice = Date.now() + processingTime;
      }

      graphData[getId(gem)] = normalizedFn(gem);
    }

    setData(graphData);

    if (gemInfo.status !== "done") {
      return;
    }

    setProgressMsg("Calculating profit flowchart loops");
    setProgress(0);
    timeSlice = Date.now() + processingTime;

    const cache = new memoize.Cache();

    i = 0;
    for (const node of Object.values(graphData).map((node) => ({ ...node }))) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / data.length;
        setProgress(p);
        timeSlice = Date.now() + processingTime;
      }
      const gem = node.gem;
      if (!gem.regrData) continue;

      const lensPrice = regradeValue(gem);
      const calc = (regrData: ConversionData[]) =>
        regrData.reduce((sum, d) => sum + normalizedFn(d.gem).expectedValue * d.chance, 0) -
        lensPrice;
      const value = calc(gem.regrData);
      if (value <= node.expectedValue) continue;

      const weights = Object.fromEntries(
        gemInfo.value.weights[gem.baseName].map(({ Type, weight }) => [Type, weight])
      );
      const totalWeight = gemInfo.value.weights[gem.baseName].reduce(
        (acc, { weight }) => acc + weight,
        0
      );

      const results: { [Type in GemType]?: GraphNode } = { [gem.Type]: node };
      const children = gem.regrData.map(({ gem }) => gem).map(normalizedFn);
      children.forEach((n) => {
        results[n.gem.Type] = n;
      });

      const values = createMatrix(results, lensPrice, weights, totalWeight, false);
      const costs = createMatrix(results, lensPrice, weights, totalWeight, true);
      solve(values);
      solve(costs);

      const newEV = values[qualityIndex[gem.Type]][qualityIndex[gem.Type]];
      const expectedCost = costs[qualityIndex[gem.Type]][qualityIndex[gem.Type]];
      if (node.expectedValue < newEV) {
        node.expectedValue = newEV;
        node.children = children.map((child) => ({
          name: "regrade",
          expectedCost,
          probability: weights[child.gem.Type] / (totalWeight - weights[gem.Type]),
          node: values[qualityIndex[child.gem.Type]][4] > 0 ? child : createReference(child.gem),
        }));
      }
      cache.set(gem, node);
    }

    memoizedFn.cache = cache;
    setProgressMsg("Calculating profit flowcharts including loops");
    setProgress(0);
    timeSlice = Date.now() + processingTime;

    i = 0;
    for (const gem of data) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / data.length;
        setProgress(p);
        timeSlice = Date.now() + processingTime;
      }

      graphData[getId(gem)] = normalizedFn(gem);
    }

    setProgress(100);
    setProgressMsg("");
    setData(graphData);
    done();
  } catch (e) {
    console.debug(e);
  }
};

const max = <T>(data: readonly (T | undefined)[], get: (v: T) => number) =>
  data?.reduce((l, r) => (!l ? r : !r ? l : get(l) > get(r) ? l : r), undefined);

const createNode = (
  gem: GemDetails,
  expectedValue: number,
  children?: GraphChild[]
): GraphNode => ({
  gem,
  expectedValue,
  children,
});
const createUnknown = (gem: GemDetails): GraphNode => ({
  gem,
  expectedValue: 0,
  children: [],
});
const createReference = (gem: GemDetails): GraphNode => ({
  gem,
  references: "parent",
  expectedValue: 0,
  children: [],
});

//For explanation of algorithm, see regrading-lens.md
const solve = (mat: number[][]) => {
  for (const [i, up] of Array.from({ length: 3 }, (_, n) => [n, true]).concat(
    Array.from({ length: 3 }, (_, n) => [3 - n, false])
  ) as [number, boolean][]) {
    for (const j of Array.from({ length: up ? 3 - i : i }, (_, n) =>
      up ? i + 1 + n : i - 1 - n
    )) {
      if (!mat[j][j] || !mat[j][i]) continue;
      if (mat[i][i] !== 1) {
        console.warn(`[${i}][${i}] value is ${mat[i][i]}`);
      }

      const multi = mat[j][i];
      for (const k of Array(5).keys()) {
        mat[j][k] -= mat[i][k] * multi;
      }
      if (!mat[j][j]) {
        console.warn(`[${j}][${j}] value is ${mat[j][j]}`);
        continue;
      }

      const div = mat[j][j];
      for (const k of Array(5).keys()) {
        mat[j][k] /= div;
      }
    }
  }
};

const createMatrix = (
  results: { [Type in GemType]?: GraphNode },
  lensPrice: number,
  weights: { [k: string]: number },
  totalWeight: number,
  costOnly: boolean
): number[][] => {
  return qualities.map((row) =>
    [...qualities, "Value"].map((col) => {
      const node = results[row];
      if (!node) {
        return 0;
      } else if (row === col) {
        return 1;
      } else if (node.expectedValue >= (node.gem.regrValue || 0)) {
        return col === "Value" ? (costOnly ? 0 : node.expectedValue) : 0;
      } else if (col === "Value") {
        return -lensPrice;
      } else {
        return weights[col] / (totalWeight - weights[row]);
      }
    })
  );
};

const handler = {
  get: (target: any, name: string) => {
    if (!target[name]) {
      target[name] = defaultObj();
    }
    return target[name];
  },
};

const defaultObj = () => new Proxy({}, handler);
