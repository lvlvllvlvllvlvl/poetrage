/* eslint-disable no-restricted-globals */
import { getCurrency } from "functions/getCurrency";
import { memoize } from "lodash";
import {
  ConversionData,
  Gem,
  GemDetails,
  GemId,
  GemType,
  altQualities,
  copy,
  exceptional,
  exists,
  getId,
  isGoodCorruption,
  qualities,
  qualityIndex,
} from "models/gems";
import { GraphChild, GraphNode, NodeMap } from "models/graphElements";
import { GraphInputs } from "state/selectors/graphInputs";

const million = 1000000;

export const buildGraph = (
  {
    inputs: {
      data,
      currencyMap,
      allowLowConfidence,
      primeRegrading,
      secRegrading,
      incQual,
      templeCost,
      awakenedLevelCost,
      awakenedRerollCost,
      gemInfo,
    },
    cancel,
  }: {
    inputs: GraphInputs;
    cancel?: URL;
  },
  self?: Window & typeof globalThis
): NodeMap | undefined => {
  try {
    const checkToken = () => {
      if (!cancel) return;
      const xhr = new XMLHttpRequest();
      xhr.open("GET", cancel, false);
      xhr.send(null);
    };
    const setData = (payload: { [key: GemId]: GraphNode }) => {
      checkToken();
      self?.postMessage({ action: "data", payload });
    };
    const setXPData = (payload: { [key: GemId]: GraphNode }) => {
      checkToken();
      self?.postMessage({ action: "xpdata", payload });
    };
    let counter = 0;
    const setProgress = (payload: number) => {
      if (counter++ % 10 === 0) {
        checkToken();
      }
      self?.postMessage({ action: "progress", payload });
    };
    const setProgressMsg = (payload: string) => self?.postMessage({ action: "msg", payload });
    const done = () => self?.postMessage({ action: "done" });

    const map: { [k: GemId]: GemDetails } = {};
    const gemMap: { [key: string]: { [key: string]: Gem[] } } = {};
    data.forEach((gem) => {
      if (!gemMap[gem.baseName]) gemMap[gem.baseName] = {};
      if (!gemMap[gem.baseName][gem.Type]) gemMap[gem.baseName][gem.Type] = [];
      gemMap[gem.baseName][gem.Type].push(gem);
      map[getId(gem)] = gem;
    });
    const getGem = (gem: Gem) => map[getId(gem)] || gem;

    const getLensForGem = ({ Name }: GemDetails) =>
      Name.includes("Support")
        ? secRegrading || getCurrency("Secondary Regrading Lens", currencyMap.value, 0)
        : primeRegrading || getCurrency("Prime Regrading Lens", currencyMap.value, 0);

    const gcp = getCurrency("Gemcutter's Prism", currencyMap.value);
    const fn = (gem: GemDetails): GraphNode => {
      const gcpResult =
        !gem.Corrupted && gem.Quality < 20
          ? normalizedFn(copy(gem, { Quality: 20, Price: 0, lowConfidence: true, Listings: 0 }))
          : undefined;
      const levelResult =
        !gem.Corrupted && gem.Type === "Awakened" && gem.Level < gem.maxLevel
          ? normalizedFn(
              copy(gem, { Level: gem.maxLevel, Price: 0, lowConfidence: true, Listings: 0 })
            )
          : undefined;
      const levelCost = (levelResult && (gem.maxLevel - gem.Level) * awakenedLevelCost) || 0;

      const action = max(
        [
          [
            "gcp",
            gcpResult?.expectedValue
              ? gcpResult.expectedValue - (gcpResult.gem.Quality - gem.Quality) * gcp
              : 0,
            ((gcpResult?.gem?.Quality || 0) - gem.Quality) * gcp,
          ],
          [
            "vaal",
            (gem.vaalData?.reduce(
              (sum, d) => sum + normalizedFn(d.gem).expectedValue * d.chance,
              0
            ) || 0) - getCurrency("Vaal Orb", currencyMap.value),
            getCurrency("Vaal Orb", currencyMap.value),
          ],
          [
            "temple",
            (gem.templeData?.reduce(
              (sum, d) => sum + normalizedFn(d.gem).expectedValue * d.chance,
              0
            ) || 0) - templeCost,
            templeCost,
          ],
          ["level", levelResult ? levelResult.expectedValue - levelCost : 0, levelCost],
          ["reroll", (gem.convertValue || 0) - awakenedRerollCost, awakenedRerollCost],
          [
            "sell",
            !gem.lowMeta &&
            (!gem.lowConfidence ||
              allowLowConfidence === "all" ||
              (allowLowConfidence === "corrupted" && isGoodCorruption(gem)))
              ? gem.Price
              : 0,
          ],
        ] as const,
        (v) => v[1] || 0
      );

      if (!action || action[1] <= 0) {
        return createUnknown(gem);
      }
      switch (action[0]) {
        case "gcp":
          return createNode(gem, action[1], [
            { name: "Gemcutter's Prism", probability: 1, node: gcpResult, expectedCost: action[2] },
          ]);
        case "vaal":
          return createNode(
            gem,
            action[1],
            gem.vaalData!.map((v) => ({
              name: `Vaal: ${v.outcomes?.[0]}`,
              probability: v.chance,
              node: normalizedFn(v.gem),
              expectedCost: action[2],
            }))
          );
        case "temple":
          return createNode(
            gem,
            action[1],
            gem.templeData!.map((v) => ({
              name: `Temple: ${v.outcomes?.[0]}`,
              probability: v.chance,
              node: normalizedFn(v.gem),
              expectedCost: action[2],
            }))
          );
        case "level":
          return createNode(gem, action[1], [
            {
              name: "Wild Brambleback",
              probability: 1,
              node: levelResult,
              expectedCost: action[2],
            },
          ]);
        case "reroll":
          return createNode(gem, action[1], [
            {
              name: "Vivid Watcher",
              probability: 1,
              expectedCost: action[2],
              node: createNode(
                copy(gem, {
                  Name: "Random awakened gem",
                  baseName: "Gem",
                  Price: Math.round(action[1]),
                }),
                action[1]
              ),
            },
          ]);
        case "sell":
          return createNode(gem, action[1]);
      }
    };

    const memoizedFn = memoize(fn, getId);
    const normalizedFn = (gem: Gem) => memoizedFn(getGem(gem));
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

    if (gemInfo.status !== "done") return;
    const getRegradeValue = (regrData: ConversionData[]) =>
      regrData.reduce((sum, d) => sum + normalizedFn(d.gem).expectedValue * d.chance, 0) -
      getLensForGem(regrData[0].gem);

    setProgressMsg("Calculating xp profit flowcharts");
    setProgress(0);
    timeSlice = Date.now() + processingTime;

    const xpData: NodeMap = {};
    const vaal = getCurrency("Vaal Orb", currencyMap.value);
    i = 0;
    for (const gem of data) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / data.length;
        setProgress(p);
        timeSlice = Date.now() + processingTime;
      }

      if (gem.XP !== undefined) {
        const qualityMultiplier =
          !altQualities.includes(gem.Type as any) && exceptional.find((e) => gem.Name.includes(e))
            ? 1 + (gem.Quality + incQual) * 0.05
            : 1;
        const possibles = gemMap[gem.baseName][gem.Type].filter(
          (other) =>
            (allowLowConfidence === "all" || !other.lowConfidence) &&
            (!gem.Corrupted || (other.Corrupted && other.Vaal === gem.Vaal)) &&
            other.Quality <= 20 &&
            other.Level <= gem.maxLevel &&
            other.XP !== undefined &&
            gemInfo.value?.xp[gem.baseName][other.Level + 1] === undefined &&
            (other.XP || 0) > (gem.XP || 0)
        );
        xpData[getId(gem)] = possibles
          .map(normalizedFn)
          .map((other) => {
            const xpDiff = ((other.gem.XP || 0) - (gem.XP || 0)) / million / qualityMultiplier;
            const gcpCount = gem.Quality < other.gem.Quality ? other.gem.Quality - gem.Quality : 0;
            const vaalCost = other.gem.Vaal && !gem.Vaal ? 4 * (gem.Price + vaal) : 0;

            if (gcpCount && gem.Corrupted) return undefined as any;
            const gcpCost = gcpCount * gcp;
            const regrValue = other.gem.regrData ? getRegradeValue(other.gem.regrData) : 0;
            const regradeCost = regrValue <= other.expectedValue ? 0 : getLensForGem(gem);
            const regradeOutcomes = regradeCost
              ? other.gem.regrData?.map((child) => ({
                  name: "Regrading lens",
                  expectedCost: regradeCost,
                  probability: child.chance,
                  node: normalizedFn(child.gem),
                }))
              : undefined;
            const xpValue = (regradeCost ? regrValue : other.expectedValue) - (gcpCost + vaalCost);

            let children = getChildren(
              other,
              gem,
              xpDiff,
              vaalCost,
              gcpCount,
              gcpCost,
              regradeOutcomes
            );
            return createNode(gem, xpValue, children, xpDiff);
          })
          .concat(
            gem.Type === "Superior" &&
              !gem.Corrupted &&
              gem.Quality < 20 &&
              gemInfo.value?.xp[gem.baseName][20]
              ? possibles
                  .filter(
                    (other) =>
                      other.Quality === 20 &&
                      (other.XP || 0) + gemInfo.value?.xp[gem.baseName][20] > (gem.XP || 0)
                  )
                  .map(normalizedFn)
                  .map((other) => {
                    const xpDiff =
                      ((other.gem.XP || 0) + gemInfo.value?.xp[gem.baseName][20] - (gem.XP || 0)) /
                      million /
                      qualityMultiplier;
                    const vaalCost = other.gem.Vaal && !gem.Vaal ? 4 * (gem.Price + vaal) : 0;
                    const regrValue = other.gem.regrData ? getRegradeValue(other.gem.regrData) : 0;
                    const regradeCost = regrValue <= other.expectedValue ? 0 : getLensForGem(gem);
                    const regradeOutcomes = regradeCost
                      ? other.gem.regrData?.map((child) => ({
                          name: "Regrading lens",
                          expectedCost: regradeCost,
                          probability: child.chance,
                          node: normalizedFn(child.gem),
                        }))
                      : undefined;
                    const xpValue =
                      (regradeCost ? regrValue : other.expectedValue) - (gcp + vaalCost);

                    let children = getChildren(other, gem, xpDiff, vaalCost, 1, 0, regradeOutcomes);
                    return createNode(gem, xpValue, children, xpDiff);
                  })
              : []
          )
          .filter(exists)
          .sort((a, b) => b.xpValue - a.xpValue)[0];
      }
    }
    setXPData(xpData);

    setProgressMsg("Calculating regrading lens loops");
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

      const lensPrice = getLensForGem(gem);
      const value = getRegradeValue(gem.regrData);
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

      const values = createMatrix(
        results,
        lensPrice,
        weights,
        totalWeight,
        getRegradeValue,
        (node) => node?.expectedValue || 0
      );
      const costs = createMatrix(
        results,
        lensPrice,
        weights,
        totalWeight,
        getRegradeValue,
        (node) => 0
      );
      const totalCosts = createMatrix(
        results,
        lensPrice,
        weights,
        totalWeight,
        getRegradeValue,
        (node) => -(node?.expectedCost || 0)
      );
      solve(values);
      solve(costs);
      solve(totalCosts);
      const newEV = values[qualityIndex[gem.Type]][4];
      const expectedCost = -costs[qualityIndex[gem.Type]][4];
      if (node.expectedValue < newEV) {
        node.expectedValue = newEV;
        node.expectedCost = -totalCosts[qualityIndex[gem.Type]][4];
        node.roi = newEV / (newEV - node.gem.Price);
        node.children = children.map((child) => {
          const retry = values[qualityIndex[child.gem.Type]][4] > child.expectedValue;
          return {
            name: "Regrading lens",
            expectedCost,
            probability: weights[child.gem.Type] / (totalWeight - weights[gem.Type]),
            node: { ...child, children: retry ? [] : child.children },
            references: retry ? "parent" : undefined,
          };
        });
      }
      cache.set(getId(gem), node);
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

    setData(graphData);
    setProgress(100);
    setProgressMsg("");
    done();

    return graphData;
  } catch (e) {
    console.debug(e);
  }
};

const max = <T>(data: readonly (T | undefined)[], get: (v: T) => number) =>
  data?.reduce((l, r) => (!l ? r : !r ? l : get(l) > get(r) ? l : r), undefined);

const createNode = (
  gem: GemDetails,
  expectedValue: number,
  children?: GraphChild[],
  experience?: number
): GraphNode => {
  const expectedCost =
    children?.reduce(
      (sum, child) =>
        sum + ((child.expectedCost || 0) + (child.node?.expectedCost || 0)) * child.probability,
      0
    ) || 0;
  const roi = (expectedValue - gem.Price) / (expectedCost + gem.Price);
  return {
    gem,
    expectedValue,
    expectedCost,
    roi,
    children,
    experience,
  };
};
const createUnknown = (gem: GemDetails): GraphNode => ({
  gem,
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
      if (mat[i][i] && mat[i][i] !== 1) {
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
      if (div) {
        for (const k of Array(5).keys()) {
          mat[j][k] /= div;
        }
      }
    }
  }
};

const createMatrix = (
  results: { [Type in GemType]?: GraphNode },
  lensPrice: number,
  weights: { [k: string]: number },
  totalWeight: number,
  calc: (regrData: ConversionData[]) => number,
  value: (node?: GraphNode) => number
): number[][] => {
  return qualities.map((row) =>
    ([...qualities, "Value"] as const).map((col) => {
      const node = results[row];
      if (!node) {
        return 0;
      } else if (row === col) {
        return 1;
      } else if (node.expectedValue >= (node.gem.regrData ? calc(node.gem.regrData) : 0)) {
        return col === "Value" ? value(node) : 0;
      } else if (col === "Value") {
        return -lensPrice;
      } else {
        return weights[row] && weights[col] ? -weights[col] / (totalWeight - weights[row]) : 0;
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

self.onmessage = (e) => buildGraph(e.data, self);
function getChildren(
  other: GraphNode,
  gem: GemDetails,
  xpDiff: number,
  vaalCost: number,
  gcpCount: number,
  gcpCost: number,
  regrade?: GraphChild[]
) {
  if (regrade) {
    other = { ...other, children: regrade };
  }
  let children: GraphChild[] = [
    { name: `${Math.round(xpDiff)} million xp`, node: other, probability: 1 },
  ];
  if (vaalCost) {
    const vaalGem = copy(gem, {
      Vaal: true,
      Corrupted: true,
      Quality: other.gem.Quality,
      Level: gem.Level < other.gem.Level ? gem.Level : 1,
    });
    children = [
      { name: "Non-vaal", probability: 0.75, references: "self", expectedCost: vaalCost },
      {
        name: "Vaal",
        probability: 0.25,
        expectedCost: vaalCost,
        node: createNode(vaalGem, 0, children),
      },
    ];
  }
  if (gcpCount) {
    const gcpGem = copy(gem, {
      Quality: other.gem.Quality,
      Level: gem.Level < other.gem.Level ? gem.Level : 1,
    });
    children = [
      {
        name: gem.Level < other.gem.Level ? "Apply GCP" : "Vendor with GCP",
        probability: 1,
        expectedCost: gcpCost,
        node: createNode(gcpGem, 0, children),
      },
    ];
  }
  return children;
}
