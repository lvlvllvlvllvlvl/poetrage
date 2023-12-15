import { GemInfo } from "apis/getGemInfo";
import info from "data/gemInfo.json";
import { getCurrency } from "functions/getCurrency";
import { memoize } from "lodash";
import {
  copy,
  exceptional,
  exists,
  Gem,
  GemDetails,
  GemId,
  getId,
  isGoodCorruption,
} from "models/gems";
import { GraphChild, GraphNode, NodeMap } from "models/graphElements";
import { GraphInputs } from "state/selectors/graphInputs";

const gemInfo = info as GemInfo;
const million = 1000000;
const channel = new MessageChannel();
const sleep = () =>
  new Promise((resolve) => {
    channel.port1.onmessage = () => {
      channel.port1.onmessage = null;
      resolve(null);
    };
    channel.port2.postMessage(null);
  });

export const buildGraph = async (
  {
    data,
    currencyMap,
    allowLowConfidence,
    incQual,
    templeCost,
    awakenedLevelCost,
    awakenedRerollCost,
  }: GraphInputs,
  self?: Window & typeof globalThis,
): Promise<NodeMap | undefined> => {
  try {
    const setData = async (payload: { [key: GemId]: GraphNode }) => {
      await sleep();
      self?.postMessage({ action: "data", payload });
    };
    const setXPData = async (payload: { [key: GemId]: GraphNode }) => {
      await sleep();
      self?.postMessage({ action: "xpdata", payload });
    };
    let counter = 0;
    const setProgress = async (payload: number) => {
      if (counter++ % 10 === 0) {
        await sleep();
      }
      self?.postMessage({ action: "progress", payload });
    };
    const setProgressMsg = (payload: string) => self?.postMessage({ action: "msg", payload });
    const done = () => self?.postMessage({ action: "done" });

    const map: { [k: GemId]: GemDetails } = {};
    const gemMap: { [key: string]: { [key: string]: Gem[] } } = {};
    data.forEach((gem) => {
      if (!gemMap[gem.baseName]) gemMap[gem.baseName] = {};
      if (!gemMap[gem.baseName][gem.discriminator || ""])
        gemMap[gem.baseName][gem.discriminator || ""] = [];
      gemMap[gem.baseName][gem.discriminator || ""].push(gem);
      map[getId(gem)] = gem;
    });
    const getGem = (gem: Gem) => map[getId(gem)] || gem;

    const gcp = getCurrency("Gemcutter's Prism", currencyMap.value);
    const fn = (gem: GemDetails): GraphNode => {
      const gcpResult =
        !gem.Corrupted && gem.Quality < 20
          ? normalizedFn(copy(gem, { Quality: 20, Price: 0, lowConfidence: true, Listings: 0 }))
          : undefined;
      const levelResult =
        !gem.Corrupted && gem.Name.includes("Awakened") && gem.Level < gem.maxLevel
          ? normalizedFn(
              copy(gem, { Level: gem.maxLevel, Price: 0, lowConfidence: true, Listings: 0 }),
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
              0,
            ) || 0) - getCurrency("Vaal Orb", currencyMap.value),
            getCurrency("Vaal Orb", currencyMap.value),
          ],
          [
            "temple",
            (gem.templeData?.reduce(
              (sum, d) => sum + normalizedFn(d.gem).expectedValue * d.chance,
              0,
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
        (v) => v[1] || 0,
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
            })),
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
            })),
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
                  Price: Math.round(action[1] + action[2]),
                }),
                action[1],
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
    await setProgress(0);
    let timeSlice = Date.now() + processingTime;

    const graphData: NodeMap = {};
    let i = 0;
    for (const gem of data) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / data.length;
        await setProgress(p);
        timeSlice = Date.now() + processingTime;
      }

      graphData[getId(gem)] = normalizedFn(gem);
    }

    await setData(graphData);

    setProgressMsg("Calculating xp profit flowcharts");
    await setProgress(0);
    timeSlice = Date.now() + processingTime;

    const xpData: NodeMap = {};
    const vaal = getCurrency("Vaal Orb", currencyMap.value);
    i = 0;
    for (const gem of data) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / data.length;
        await setProgress(p);
        timeSlice = Date.now() + processingTime;
      }

      if (gem.XP !== undefined) {
        const qualityMultiplier = exceptional.find((e) => gem.Name.includes(e))
          ? 1 + (gem.Quality + incQual) * 0.05
          : 1;
        const possibles = gemMap[gem.baseName][gem.discriminator || ""].filter(
          (other) =>
            (allowLowConfidence === "all" || !other.lowConfidence) &&
            (!gem.Corrupted || (other.Corrupted && other.Vaal === gem.Vaal)) &&
            other.Quality <= 20 &&
            other.Level <= gem.maxLevel &&
            other.XP !== undefined &&
            gemInfo.xp[gem.baseName][other.Level + 1] === undefined &&
            (other.XP || 0) > (gem.XP || 0),
        );
        xpData[getId(gem)] = possibles
          .map(normalizedFn)
          .map((other) => {
            const xpDiff = ((other.gem.XP || 0) - (gem.XP || 0)) / million / qualityMultiplier;
            const gcpCount = gem.Quality < other.gem.Quality ? other.gem.Quality - gem.Quality : 0;
            const vaalCost = other.gem.Vaal && !gem.Vaal ? 4 * (gem.Price + vaal) : 0;

            if (gcpCount && gem.Corrupted) return undefined as any;
            const gcpCost = gcpCount * gcp;
            const xpValue = other.expectedValue - (gcpCost + vaalCost);

            let children = getChildren(other, gem, xpDiff, vaalCost, gcpCount, gcpCost);
            return createNode(gem, xpValue, children, xpDiff);
          })
          .concat(
            !gem.Corrupted && gem.Quality < 20 && gemInfo.xp[gem.baseName][20]
              ? possibles
                  .filter(
                    (other) =>
                      other.Quality === 20 &&
                      (other.XP || 0) + (gemInfo.xp[gem.baseName][20] || 0) > (gem.XP || 0),
                  )
                  .map(normalizedFn)
                  .map((other) => {
                    const xpDiff =
                      ((other.gem.XP || 0) + (gemInfo.xp[gem.baseName][20] || 0) - (gem.XP || 0)) /
                      million /
                      qualityMultiplier;
                    const vaalCost = other.gem.Vaal && !gem.Vaal ? 4 * (gem.Price + vaal) : 0;
                    const xpValue = other.expectedValue - (gcp + vaalCost);

                    let children = getChildren(other, gem, xpDiff, vaalCost, 1, 0);
                    return createNode(gem, xpValue, children, xpDiff);
                  })
              : [],
          )
          .filter(exists)
          .sort((a, b) => b.xpValue - a.xpValue)[0];
      }
    }
    await setXPData(xpData);

    setProgressMsg("Calculating profit flowcharts including loops");
    await setProgress(0);
    timeSlice = Date.now() + processingTime;

    i = 0;
    for (const gem of data) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / data.length;
        await setProgress(p);
        timeSlice = Date.now() + processingTime;
      }

      graphData[getId(gem)] = normalizedFn(gem);
    }

    await setData(graphData);
    await setProgress(100);
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
  experience?: number,
): GraphNode => {
  const expectedCost =
    children?.reduce(
      (sum, child) =>
        sum + ((child.expectedCost || 0) + (child.node?.expectedCost || 0)) * child.probability,
      0,
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

self.onmessage = (e) => buildGraph(e.data, self);
function getChildren(
  other: GraphNode,
  gem: GemDetails,
  xpDiff: number,
  vaalCost: number,
  gcpCount: number,
  gcpCost: number,
) {
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
