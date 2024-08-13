import { GemInfo } from "apis/getGemInfo";
import info from "data/gemInfo.json";
import permutations from "data/permutations.json";
import { filterOutliers, mean } from "functions/filterOutliers";
import { getCurrency } from "functions/getCurrency";
import { isNumber } from "lodash";
import {
  bestMatch,
  betterOrEqual,
  compareGem,
  ConversionData,
  copy,
  exceptional,
  exists,
  Gem,
  GemDetails,
  isEqual,
  mavenCrucible,
  mavenExclusive,
  normalizeOutcomes,
  strictlyBetter,
  vaal,
} from "models/gems";
import { ApiResult } from "state/api";
import { ProfitInputs } from "state/selectors/profitInputs";

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

export const calculateProfits = async (
  {
    gems,
    currencyMap,
    leagueIsIndexed,
    meta,
    filterMeta,
    overrides,
    sanitize,
    lowConfidence,
    incQual,
    mavenExclusiveWeight,
    mavenCrucibleWeight,
  }: ProfitInputs,
  self?: Window & typeof globalThis,
) => {
  try {
    if (
      gems.status !== "done" ||
      currencyMap.status !== "done" ||
      (leagueIsIndexed && meta.status !== "done")
    ) {
      return;
    }

    const setData = async (payload: GemDetails[]) => {
      await sleep();
      self?.postMessage({ action: "data", payload });
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

    setProgressMsg("Formatting data");

    const missingXP: { [gem: string]: true } = {};
    const vaalGems: { [key: string]: boolean } = {};
    let result: GemDetails[] =
      gems.value.source === "ninja"
        ? gems.value.data.map((original) => {
            const {
              name,
              variant,
              chaosValue,
              gemLevel,
              gemQuality,
              corrupted,
              listingCount,
              sparkline,
            } = original;
            let baseName = name.replace("Vaal ", "");
            const transBase = gemInfo.transfigureBases[baseName];
            const discriminator = transBase?.discriminator;
            baseName = transBase?.baseName || baseName;
            const Vaal = name.includes("Vaal");

            const Meta = getMeta(meta, name);
            const levels = gemInfo.xp[baseName];
            if (!levels) {
              missingXP[baseName] = true;
            }
            vaalGems[baseName] = vaalGems[baseName] || Vaal;
            let lowConfidence = !sparkline?.data?.length;
            if (!lowConfidence) {
              const today = sparkline.data[sparkline.data.length - 1];
              if (isNumber(today) && isFinite(today)) {
                const avg = mean(sparkline.data.filter(isNumber)) + 100;
                const absRatio = Math.max(avg, today + 100) / Math.min(avg, today + 100);
                //price is more than double or half recent average, check if it is an outlier
                if (absRatio > 2) {
                  const filtered = filterOutliers(sparkline.data.filter(isNumber), 2);
                  if (!filtered.includes(today)) {
                    lowConfidence = true;
                    console.debug(
                      `${name} ${variant} (${chaosValue}c) failed tau test (${today}, [${filtered}], ratio: ${absRatio}), marking low confidence`,
                    );
                  }
                }
              } else {
                lowConfidence = true;
              }
            }
            return {
              original,
              Name: name,
              baseName,
              discriminator,
              variant,
              Color: gemInfo.color[baseName],
              Level: gemLevel,
              XP: levels?.[gemLevel],
              Quality: gemQuality || 0,
              Corrupted: corrupted || false,
              Vaal,
              Price: Math.round(chaosValue || 0),
              Meta,
              Listings: listingCount,
              maxLevel: gemInfo.maxLevel[baseName as keyof typeof gemInfo.maxLevel],
              lowMeta: Meta < filterMeta,
              lowConfidence: lowConfidence || Meta < filterMeta,
            } as GemDetails;
          })
        : gems.value.data.map((original) => {
            let {
              name,
              gemLevel,
              gemQuality,
              gemIsCorrupted: corrupted,
              daily: Listings,
              lowConfidence,
            } = original;
            const chaosValue = original.min || original.mean;
            let baseName = name.replace("Vaal ", "");
            const transBase = gemInfo.transfigureBases[baseName];
            const discriminator = transBase?.discriminator;
            baseName = transBase?.baseName || baseName;
            const Vaal = name.includes("Vaal");
            const Meta = getMeta(meta, name);
            const variant = `${gemLevel}/${gemQuality}${corrupted ? "c" : ""}`;
            const levels = gemInfo.xp[baseName];

            if (!levels) {
              missingXP[baseName] = true;
            }
            vaalGems[baseName] = vaalGems[baseName] || Vaal;
            if (!chaosValue) {
              lowConfidence = true;
            }
            if (!lowConfidence) {
              const avg = mean(original.history);
              const absRatio = Math.max(avg, chaosValue) / Math.min(avg, chaosValue);
              //price is more than double or half recent average, check if it is an outlier
              if (absRatio > 2) {
                const filtered = filterOutliers([...original.history, chaosValue], 2);
                if (!filtered.includes(chaosValue)) {
                  lowConfidence = true;
                  console.debug(
                    `${name} ${variant} (${chaosValue}c) failed tau test (${filtered}, ${absRatio}), marking low confidence`,
                  );
                }
              }
            }
            return {
              original,
              Name: name,
              baseName,
              discriminator,
              variant,
              Color: gemInfo.color[baseName],
              Level: gemLevel,
              XP: levels?.[gemLevel],
              Quality: gemQuality || 0,
              Corrupted: corrupted || false,
              Vaal,
              Price: Math.round(chaosValue || 0),
              Meta,
              Listings,
              maxLevel: gemInfo.maxLevel[baseName as keyof typeof gemInfo.maxLevel],
              lowMeta: Meta < filterMeta,
              lowConfidence: lowConfidence || Meta < filterMeta,
            } as GemDetails;
          });

    const notFound = new Set(overrides);
    result = result
      .map((gem) => {
        const update = overrides.find((o) => isEqual(gem, o.original ?? o.override));
        if (update) {
          notFound.delete(update);
          return { ...gem, ...update.override };
        } else {
          return gem;
        }
      })
      .concat(Array.from(notFound).map((o) => o.override as GemDetails));

    const gemMap: { [key: string]: { [key: string]: Gem[] } } = {};
    result.forEach((gem) => {
      gem.canVaal = vaalGems[gem.baseName];
      if (!gemMap[gem.baseName]) gemMap[gem.baseName] = {};
      if (!gemMap[gem.baseName][gem.discriminator || ""])
        gemMap[gem.baseName][gem.discriminator || ""] = [];
      gemMap[gem.baseName][gem.discriminator || ""].push(copy(gem));
    });

    Object.values(gemMap).forEach((v) =>
      Object.keys(v).forEach((k) => {
        v[k] = v[k].sort(compareGem);
      }),
    );

    const toMark: Gem[] = [];
    //Mark gems that are priced higher than strictly better versions of the same gem as low confidence
    result.forEach((gem) => {
      for (const other of gemMap[gem.baseName][gem.discriminator || ""]) {
        if (
          (sanitize === "yes" || (sanitize === "corrupted" && gem.Corrupted)) &&
          !gem.lowConfidence &&
          !other.lowConfidence &&
          !gem.isOverride &&
          other.Price * 1.1 < gem.Price &&
          strictlyBetter(other, gem)
        ) {
          console.debug(
            `${gem.Name} ${gem.variant} (${gem.Price} chaos) worth more than ${other.variant} (${other.Price} chaos), marking low confidence`,
          );
          toMark.push(gem);
          break;
        }
      }
    });
    toMark.forEach((gem) => {
      gem.lowConfidence = true;
    });

    //Rebuild gemMap with sanitized data
    Object.keys(gemMap).forEach((k) => delete gemMap[k]);
    result.forEach((gem) => {
      gem.canVaal = vaalGems[gem.baseName];
      if (!gemMap[gem.baseName]) gemMap[gem.baseName] = {};
      if (!gemMap[gem.baseName][gem.discriminator || ""])
        gemMap[gem.baseName][gem.discriminator || ""] = [];
      gemMap[gem.baseName][gem.discriminator || ""].push(copy(gem));
    });

    Object.values(gemMap).forEach((v) =>
      Object.keys(v).forEach((k) => {
        v[k] = v[k].sort(compareGem);
      }),
    );

    await setData(result);
    setProgressMsg("Calculating gcp values");
    await setProgress(0);

    const processingTime = 400;
    let timeSlice = Date.now() + processingTime;

    const oneGcp = getCurrency("Gemcutter's Prism", currencyMap.value);

    let i = 0;
    for (const gem of result) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / result.length;
        await setProgress(p);
        timeSlice = Date.now() + processingTime;
      }

      //GCP
      if (!gem.Corrupted) {
        gem.gcpData = result
          .filter(
            (other) =>
              (lowConfidence === "all" || !other.lowConfidence) &&
              other.Name === gem.Name &&
              !other.Corrupted &&
              other.Level === gem.Level &&
              other.Quality > gem.Quality,
          )
          .map((other) => {
            const gcpCount = other.Quality - gem.Quality;
            const gcpCost = gcpCount * oneGcp;
            const gcpValue = other.Price - (gem.Price + gcpCost);
            return { ...other, gcpCount, gcpCost, gcpValue };
          })
          .sort((a, b) => b.gcpValue - a.gcpValue);
        gem.gcpValue = gem.gcpData[0]?.gcpValue;
      }
    }

    await setData(result);
    setProgressMsg("Calculating xp values");
    await setProgress(0);
    timeSlice = Date.now() + processingTime;

    i = 0;
    for (const gem of result) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / result.length;
        await setProgress(p);
        timeSlice = Date.now() + processingTime;
      }

      //XP
      if (gem.XP !== undefined) {
        const qualityMultiplier = exceptional.find((e) => gem.Name.includes(e))
          ? 1 + (gem.Quality + incQual) * 0.05
          : 1;
        const possibles = gemMap[gem.baseName][gem.discriminator || ""].filter(
          (other) =>
            (lowConfidence || !other.lowConfidence) &&
            other.Corrupted === gem.Corrupted &&
            other.Vaal === gem.Vaal &&
            other.XP !== undefined &&
            gemInfo.xp[gem.baseName][other.Level + 1] === undefined &&
            (other.XP || 0) > (gem.XP || 0),
        );
        gem.xpData = possibles
          .map((other) => {
            const gcpCount = gem.Quality < other.Quality ? other.Quality - gem.Quality : 0;
            if (gcpCount && gem.Corrupted) return undefined as any;
            const gcpCost = gcpCount * oneGcp;
            const xpDiff = ((other.XP || 0) - (gem.XP || 0)) / million / qualityMultiplier;
            const xpValue = (other.Price - (gem.Price + gcpCost)) / xpDiff;
            return { ...other, gcpCount, gcpCost, xpValue, xpDiff };
          })
          .concat(
            !gem.Corrupted &&
              gem.Quality < 20 &&
              gem.Name.includes("Support") &&
              gemInfo.xp[gem.baseName][20]
              ? possibles
                  .filter(
                    (other) =>
                      other.Quality === 20 &&
                      (other.XP || 0) + (gemInfo.xp[gem.baseName][20] || 0) > (gem.XP || 0),
                  )
                  .map((other) => {
                    const xpDiff =
                      ((other.XP || 0) + (gemInfo.xp[gem.baseName][20] || 0) - (gem.XP || 0)) /
                      million /
                      qualityMultiplier;

                    return copy(other, {
                      gcpCount: 1,
                      gcpCost: oneGcp,
                      reset: true,
                      xpDiff,
                      xpValue: (other.Price - (gem.Price + oneGcp)) / xpDiff,
                    });
                  })
              : [],
          )
          .filter(exists)
          .sort((a, b) => b.xpValue - a.xpValue);
        gem.xpValue = gem.xpData[0]?.xpValue || 0;
      }
    }

    await setData(result);
    setProgressMsg("Calculating Wild Brambleback values");
    await setProgress(0);
    timeSlice = Date.now() + processingTime;

    i = 0;
    for (const gem of result) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / result.length;
        await setProgress(p);
        timeSlice = Date.now() + processingTime;
      }

      //Awakened Gem levels
      if (gem.Name.includes("Awakened") && !gem.Corrupted) {
        const possibles = gemMap[gem.baseName][gem.discriminator || ""].filter(
          (other) =>
            (lowConfidence || !other.lowConfidence) &&
            !other.Corrupted &&
            other.XP !== undefined &&
            other.Level > gem.Level,
        );
        gem.levelData = possibles
          .map((other) => {
            const gcpCount = gem.Quality < other.Quality ? other.Quality - gem.Quality : 0;
            if (gcpCount && gem.Corrupted) return undefined as any;
            const gcpCost = gcpCount * oneGcp;
            const levelDiff = other.Level - gem.Level;
            const levelValue = Math.round((other.Price - (gem.Price + gcpCost)) / levelDiff);
            return { ...other, gcpCount, gcpCost, levelValue, levelDiff };
          })
          .filter(exists)
          .sort((a, b) => b.levelValue - a.levelValue);
        gem.levelValue = gem.levelData[0]?.levelValue || 0;
      }
    }

    await setData(result);
    setProgressMsg("Calculating Vivid Watcher values");
    await setProgress(0);
    timeSlice = Date.now() + processingTime;

    i = 0;
    for (const gem of result) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / result.length;
        await setProgress(p);
        timeSlice = Date.now() + processingTime;
      }

      //Awakened Gem conversion
      if (
        gem.Name.includes("Awakened") &&
        !gem.Corrupted &&
        !exceptional.find((e) => gem.Name.includes(e))
      ) {
        const exclusive = mavenExclusive.filter((v) => v !== gem.Name);
        const crucible = mavenCrucible.filter((v) => v !== gem.Name);
        const totalWeight =
          exclusive.length * mavenExclusiveWeight + crucible.length * mavenCrucibleWeight;
        if (exclusive.length + crucible.length === mavenExclusive.length + mavenCrucible.length) {
          console.warn(gem.Name + " not recognized");
        }
        const convertData = exclusive
          .map((Name) => ({
            chance: mavenExclusiveWeight / totalWeight,
            outcomes: [Name],
            gem: bestMatch(
              copy(gem, { Name, baseName: Name }),
              gemMap[Name]?.[gem.discriminator || ""],
              lowConfidence,
            ),
          }))
          .concat(
            crucible.map((Name) => ({
              chance: mavenCrucibleWeight / totalWeight,
              outcomes: [Name],
              gem: bestMatch(
                copy(gem, { Name, baseName: Name }),
                gemMap[Name]?.[gem.discriminator || ""],
                lowConfidence,
              ),
            })),
          );
        gem.convertData = convertData;
        gem.convertValue =
          (convertData?.reduce(
            (sum, { gem: { Price }, chance }) => sum + (Price || 0) * chance,
            0,
          ) || 0) - gem.Price;
      }
    }

    await setData(result);
    setProgressMsg("Calculating Transfigure values");
    await setProgress(0);
    timeSlice = Date.now() + processingTime;

    i = 0;
    for (const gem of result) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / result.length;
        await setProgress(p);
        timeSlice = Date.now() + processingTime;
      }

      //Transfiguration
      if (!gem.discriminator && gemInfo.transfigurations[gem.baseName]) {
        const outcomes = Object.entries(gemInfo.transfigurations[gem.baseName]);
        gem.transData = outcomes.map(([discriminator, Name]) => ({
          chance: 1 / outcomes.length,
          outcomes: [Name],
          gem: bestMatch(
            copy(gem, { Name, discriminator }),
            gemMap[gem.baseName]?.[discriminator],
            lowConfidence,
          ),
        }));
        gem.transData.sort((l, r) => (r.gem.Price || 0) - (l.gem.Price || 0));
        gem.transValue =
          (gem.transData?.reduce(
            (sum, { gem: { Price }, chance }) => sum + (Price || 0) * chance,
            0,
          ) || 0) - gem.Price;
      } else {
        gem.transValue = 0;
      }
    }

    await setData(result);
    setProgressMsg("Calculating Random Transfigure values");
    await setProgress(0);
    timeSlice = Date.now() + processingTime;

    i = 0;
    for (const gem of result) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / result.length;
        await setProgress(p);
        timeSlice = Date.now() + processingTime;
      }

      if (!gem.Color || gem.Name.includes("Support") || (gem.Corrupted && !gem.discriminator)) {
        gem.transAnyValue = 0;
        continue;
      }

      const tag = `${gem.variant}${gem.Color}`;
      //Transfiguration by color
      const outcomes = gemInfo.transByColor[gem.Color];
      let permutation = permutations[outcomes.length];
      if (!permutation?.total || !permutation.counts) {
        console.warn("no permutation data for count", outcomes.length);
        continue;
      }
      const gems = outcomes.map((Name) => {
        const { baseName, discriminator } = gemInfo.transfigureBases[Name];
        return bestMatch(
          copy(gem, { Name, baseName, discriminator }),
          gemMap[baseName]?.[discriminator],
          lowConfidence,
        );
      });
      gems.sort((l, r) => (r.Price || 0) - (l.Price || 0));
      let sum = 0;
      const data = gems
        .filter(({ Price }) => Price > gem.Price)
        .map((other, i) => {
          sum = sum + (other.Price - gem.Price) * permutation.counts![i];
          return {
            chance: permutation.counts![i] / permutation.total!,
            outcomes: [other.Name],
            gem: other,
          };
        });
      gem.transAnyValue = sum / permutation.total!;
      gem.transAnyData = data;
    }

    await setData(result);
    setProgressMsg("Calculating vaal outcomes");
    await setProgress(0);
    timeSlice = Date.now() + processingTime;

    i = 0;
    for (const gem of result) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / result.length;
        await setProgress(p);
        timeSlice = Date.now() + processingTime;
      }

      //Corruption
      if (!gem.Corrupted) {
        const vaalData = vaal(gem).map((v) => ({
          ...v,
          gem: bestMatch(v.gem, gemMap[v.gem.baseName][v.gem.discriminator || ""], lowConfidence),
        }));
        gem.vaalValue =
          (vaalData?.reduce((sum, { gem, chance }) => sum + (gem?.Price || 0) * chance, 0) || 0) -
          gem.Price -
          getCurrency("Vaal Orb", currencyMap.value);
        let merged: ConversionData | null = null;
        let sumChance = 0;
        gem.vaalData = [];
        vaalData.forEach((next) => {
          sumChance += next.chance;
          if (merged === null) {
            merged = { ...next };
          } else if (
            (merged.gem === next.gem ||
              (betterOrEqual(merged.gem, next.gem) && betterOrEqual(next.gem, merged.gem))) &&
            merged.outcomes[0] === next.outcomes[0]
          ) {
            merged.chance += next.chance;
          } else if (
            merged.gem.Listings === 0 &&
            next.gem.Listings === 0 &&
            merged.outcomes[0] === next.outcomes[0]
          ) {
            merged.chance += next.chance;
            merged.gem = copy(merged.gem, {
              Quality: Math.min(merged.gem.Quality, next.gem.Quality),
            });
          } else {
            gem.vaalData?.push(merged);
            merged = { ...next };
          }
        });
        merged && gem.vaalData?.push(merged);
        gem.vaalData?.sort((l, r) => (r.gem.Price || 0) - (l.gem.Price || 0));
        if (sumChance < 0.99 || sumChance > 1.01) {
          console.debug("Incorrect vaal outcome chance", sumChance, vaalData);
        }
      } else {
        gem.vaalValue = 0;
        gem.templeValue = 0;
      }
    }

    await setData(result);
    setProgressMsg("Calculating temple corruption outcomes");
    await setProgress(0);
    timeSlice = Date.now() + processingTime;

    i = 0;
    for (const gem of result) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / result.length;
        await setProgress(p);
        timeSlice = Date.now() + processingTime;
      }

      // Temple corruption
      if (!gem.Corrupted) {
        let templeData: ConversionData[] = [];
        vaal(copy(gem, { Price: 0, Listings: 0 })).forEach(({ gem, chance, outcomes }) => {
          templeData = templeData.concat(vaal(gem, chance, outcomes));
        });
        templeData = templeData
          .map((v) => ({
            ...v,
            gem: bestMatch(v.gem, gemMap[v.gem.baseName][v.gem.discriminator || ""], lowConfidence),
          }))
          .sort((a, b) => compareGem(a.gem, b.gem));
        gem.templeData = [];
        let merged: ConversionData | null = null;
        let sumChance = 0;
        templeData.forEach((next) => {
          sumChance += next.chance;
          if (merged === null) {
            merged = { ...next, outcomes: [normalizeOutcomes(next.outcomes)] };
          } else if (
            merged.gem === next.gem ||
            (betterOrEqual(merged.gem, next.gem) && betterOrEqual(next.gem, merged.gem))
          ) {
            merged.chance += next.chance;
          } else if (
            merged.gem.Listings === 0 &&
            next.gem.Listings === 0 &&
            merged.outcomes[0] === normalizeOutcomes(next.outcomes)
          ) {
            merged.chance += next.chance;
            merged.gem = copy(merged.gem, {
              Quality: Math.min(merged.gem.Quality, next.gem.Quality),
            });
          } else {
            gem.templeData?.push(merged);
            merged = { ...next, outcomes: [normalizeOutcomes(next.outcomes)] };
          }
        });
        merged && gem.templeData?.push(merged);
        gem.templeData?.sort((l, r) => (r.gem.Price || 0) - (l.gem.Price || 0));
        if (sumChance < 0.99 || sumChance > 1.01) {
          console.debug("Incorrect temple outcome chance", sumChance, gem.templeData);
        }
        gem.templeValue =
          (gem.templeData?.reduce((sum, { gem, chance }) => sum + (gem?.Price || 0) * chance, 0) ||
            0) - gem.Price;
      } else {
        gem.templeValue = 0;
      }
    }

    await setProgress(100);
    setProgressMsg("");
    await setData(result);
    done();

    return result;
  } catch (e) {
    console.debug(e);
  }
};

self.onmessage = ({ data }) => calculateProfits(data, self);

function getMeta(meta: ApiResult<{ [key: string]: number }>, name: string) {
  if (meta.status !== "done") {
    return 0;
  } else {
    return meta.value[name] || 0;
  }
}
