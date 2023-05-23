/* eslint-disable no-restricted-globals */
import { filterOutliers, mean } from "functions/filterOutliers";
import { getCurrency } from "functions/getCurrency";
import { isNumber } from "lodash";
import {
  ConversionData,
  Gem,
  GemDetails,
  GemType,
  altQualities,
  bestMatch,
  betterOrEqual,
  compareGem,
  copy,
  exceptional,
  exists,
  getType,
  isEqual,
  mavenCrucible,
  mavenExclusive,
  modifiers,
  normalizeOutcomes,
  strictlyBetter,
  vaal,
} from "models/gems";
import { ApiResult } from "state/api";
import { ProfitInputs } from "state/selectors/profitInputs";

const million = 1000000;

export const calculateProfits = (
  {
    cancel,
    inputs: {
      gems,
      currencyMap,
      leagueIsIndexed,
      meta,
      gemInfo,
      filterMeta,
      overrides,
      sanitize,
      lowConfidence,
      incQual,
      mavenExclusiveWeight,
      mavenCrucibleWeight,
    },
  }: {
    inputs: ProfitInputs;
    cancel?: URL;
  },
  self?: Window & typeof globalThis
) => {
  try {
    if (
      gems.status !== "done" ||
      currencyMap.status !== "done" ||
      (leagueIsIndexed && meta.status !== "done") ||
      gemInfo.status !== "done"
    ) {
      return;
    }

    const checkToken = () => {
      if (!cancel) return;
      const xhr = new XMLHttpRequest();
      xhr.open("GET", cancel, false);
      xhr.send(null);
    };
    const setData = (payload: GemDetails[]) => {
      checkToken();
      self?.postMessage({ action: "data", payload });
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
            const baseName = modifiers.reduce((name, mod) => name.replace(mod, ""), name);
            const Vaal = name.includes("Vaal");
            const Type = getType(name);

            const Meta = getMeta(meta, Vaal, Type, name);
            const levels = gemInfo.value?.xp[Type === "Awakened" ? name : baseName];
            if (!levels) {
              missingXP[Type === "Awakened" ? name : baseName] = true;
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
                      `${name} ${variant} (${chaosValue}c) failed tau test (${today}, [${filtered}], ratio: ${absRatio}), marking low confidence`
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
              variant,
              Level: gemLevel,
              XP: levels?.[gemLevel],
              Quality: gemQuality || 0,
              Corrupted: corrupted || false,
              Vaal,
              Type,
              Price: Math.round(chaosValue || 0),
              Meta,
              Listings: listingCount,
              maxLevel: gemInfo.value.maxLevel[baseName],
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
            const baseName = modifiers.reduce((name, mod) => name.replace(mod, ""), name);
            const Vaal = name.includes("Vaal");
            const Type = getType(name);
            const Meta = getMeta(meta, Vaal, Type, name);
            const variant = `${gemLevel}/${gemQuality}${corrupted ? "c" : ""}`;
            const levels = gemInfo.value?.xp[Type === "Awakened" ? name : baseName];

            if (!levels) {
              missingXP[Type === "Awakened" ? name : baseName] = true;
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
                    `${name} ${variant} (${chaosValue}c) failed tau test (${filtered}, ${absRatio}), marking low confidence`
                  );
                }
              }
            }
            return {
              original,
              Name: name,
              baseName,
              variant,
              Level: gemLevel,
              XP: levels?.[gemLevel],
              Quality: gemQuality || 0,
              Corrupted: corrupted || false,
              Vaal,
              Type,
              Price: Math.round(chaosValue || 0),
              Meta,
              Listings,
              maxLevel: gemInfo.value.maxLevel[baseName],
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
      if (!gemMap[gem.baseName][gem.Type]) gemMap[gem.baseName][gem.Type] = [];
      gemMap[gem.baseName][gem.Type].push(copy(gem));
    });

    Object.values(gemMap).forEach((v) =>
      Object.keys(v).forEach((k) => {
        v[k] = v[k].sort(compareGem);
      })
    );

    const toMark: Gem[] = [];
    //Mark gems that are priced higher than strictly better versions of the same gem as low confidence
    result.forEach((gem) => {
      for (const other of gemMap[gem.baseName][gem.Type]) {
        if (
          (sanitize === "yes" || (sanitize === "corrupted" && gem.Corrupted)) &&
          !gem.lowConfidence &&
          !other.lowConfidence &&
          !gem.isOverride &&
          other.Price * 1.1 < gem.Price &&
          strictlyBetter(other, gem)
        ) {
          console.debug(
            `${gem.Name} ${gem.variant} (${gem.Price} chaos) worth more than ${other.variant} (${other.Price} chaos), marking low confidence`
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
      if (!gemMap[gem.baseName][gem.Type]) gemMap[gem.baseName][gem.Type] = [];
      gemMap[gem.baseName][gem.Type].push(copy(gem));
    });

    Object.values(gemMap).forEach((v) =>
      Object.keys(v).forEach((k) => {
        v[k] = v[k].sort(compareGem);
      })
    );

    setData(result);
    setProgressMsg("Calculating gcp values");
    setProgress(0);

    const processingTime = 400;
    let timeSlice = Date.now() + processingTime;

    const oneGcp = getCurrency("Gemcutter's Prism", currencyMap.value);

    let i = 0;
    for (const gem of result) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / result.length;
        setProgress(p);
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
              other.Quality > gem.Quality
          )
          .map((other) => {
            const gcpCount = other.Quality - gem.Quality;
            const gcpCost = gcpCount * oneGcp;
            const gcpValue = other.Price - (gem.Price + gcpCost);
            return { ...other, gcpCount, gcpCost, gcpValue };
          })
          .sort((a, b) => b.gcpValue - a.gcpValue);
        gem.gcpValue = gem.gcpData[0]?.gcpValue || 0;
      }
    }

    setData(result);
    setProgressMsg("Calculating xp values");
    setProgress(0);
    timeSlice = Date.now() + processingTime;

    i = 0;
    for (const gem of result) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / result.length;
        setProgress(p);
        timeSlice = Date.now() + processingTime;
      }

      //XP
      if (gem.XP !== undefined) {
        const qualityMultiplier =
          !altQualities.includes(gem.Type as any) && exceptional.find((e) => gem.Name.includes(e))
            ? 1 + (gem.Quality + incQual) * 0.05
            : 1;
        const possibles = gemMap[gem.baseName][gem.Type].filter(
          (other) =>
            (lowConfidence || !other.lowConfidence) &&
            other.Corrupted === gem.Corrupted &&
            other.Vaal === gem.Vaal &&
            other.XP !== undefined &&
            gemInfo.value?.xp[gem.baseName][other.Level + 1] === undefined &&
            (other.XP || 0) > (gem.XP || 0)
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
                  .map((other) => {
                    const xpDiff =
                      ((other.XP || 0) + gemInfo.value?.xp[gem.baseName][20] - (gem.XP || 0)) /
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
              : []
          )
          .filter(exists)
          .sort((a, b) => b.xpValue - a.xpValue);
        gem.xpValue = gem.xpData[0]?.xpValue || 0;
      }
    }

    setData(result);
    setProgressMsg("Calculating Wild Brambleback values");
    setProgress(0);
    timeSlice = Date.now() + processingTime;

    i = 0;
    for (const gem of result) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / result.length;
        setProgress(p);
        timeSlice = Date.now() + processingTime;
      }

      //Awakened Gem levels
      if (gem.Type === "Awakened" && !gem.Corrupted) {
        const possibles = gemMap[gem.baseName][gem.Type].filter(
          (other) =>
            (lowConfidence || !other.lowConfidence) &&
            !other.Corrupted &&
            other.XP !== undefined &&
            other.Level > gem.Level
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

    setData(result);
    setProgressMsg("Calculating Vivid Watcher values");
    setProgress(0);
    timeSlice = Date.now() + processingTime;

    i = 0;
    for (const gem of result) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / result.length;
        setProgress(p);
        timeSlice = Date.now() + processingTime;
      }

      //Awakened Gem conversion
      if (
        gem.Type === "Awakened" &&
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
              gemMap[Name]?.[gem.Type],
              lowConfidence
            ),
          }))
          .concat(
            crucible.map((Name) => ({
              chance: mavenCrucibleWeight / totalWeight,
              outcomes: [Name],
              gem: bestMatch(
                copy(gem, { Name, baseName: Name }),
                gemMap[Name]?.[gem.Type],
                lowConfidence
              ),
            }))
          );
        gem.convertData = convertData;
        gem.convertValue =
          (convertData?.reduce(
            (sum, { gem: { Price }, chance }) => sum + (Price || 0) * chance,
            0
          ) || 0) - gem.Price;
      }
    }

    setData(result);
    setProgressMsg("Calculating regrading lens values");
    setProgress(0);
    timeSlice = Date.now() + processingTime;
    const missingQual = {} as { [baseName: string]: true };

    i = 0;
    if (gemInfo.status === "done") {
      i++;
      for (const gem of result) {
        if (Date.now() > timeSlice) {
          const p = (100 * i) / result.length;
          setProgress(p);
          timeSlice = Date.now() + processingTime;
        }

        if (!gem.Corrupted && gem.Type !== "Awakened" && gemInfo.value.weights[gem.baseName]) {
          const weights = gemInfo.value.weights[gem.baseName].filter(
            ({ Type }) => Type !== gem.Type
          );
          const totalWeight = weights.reduce(
            (sum, { Type, weight }) => (Type === gem.Type ? sum : sum + weight),
            0
          );
          if (!totalWeight) return;
          gem.regrData = weights.map(({ Type, weight }) => ({
            chance: weight / totalWeight,
            outcomes: [Type],
            gem: bestMatch(copy(gem, { Type }), gemMap[gem.baseName][Type], lowConfidence),
          }));
          gem.regrValue =
            (gem.regrData?.reduce(
              (sum, { gem: { Price }, chance }) => sum + (Price || 0) * chance,
              0
            ) || 0) - gem.Price;
        } else {
          if (!gem.Corrupted && gem.Type !== "Awakened") {
            missingQual[gem.baseName] = true;
          }
          gem.regrValue = 0;
        }
      }
    }

    for (const missing of Object.keys(missingQual).sort()) {
      console.debug(`Missing alt quality data for ${missing}`);
    }

    setData(result);
    setProgressMsg("Calculating vaal outcomes");
    setProgress(0);
    timeSlice = Date.now() + processingTime;

    i = 0;
    for (const gem of result) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / result.length;
        setProgress(p);
        timeSlice = Date.now() + processingTime;
      }

      //Corruption
      if (!gem.Corrupted) {
        const vaalData = vaal(gem).map((v) => ({
          ...v,
          gem: bestMatch(v.gem, gemMap[v.gem.baseName][v.gem.Type], lowConfidence),
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
        if (sumChance < 0.99 || sumChance > 1.01) {
          console.debug("Incorrect vaal outcome chance", sumChance, vaalData);
        }
      } else {
        gem.vaalValue = 0;
        gem.templeValue = 0;
      }
    }

    setData(result);
    setProgressMsg("Calculating temple corruption outcomes");
    setProgress(0);
    timeSlice = Date.now() + processingTime;

    i = 0;
    for (const gem of result) {
      i++;
      if (Date.now() > timeSlice) {
        const p = (100 * i) / result.length;
        setProgress(p);
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
            gem: bestMatch(v.gem, gemMap[v.gem.baseName][v.gem.Type], lowConfidence),
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

    setProgress(100);
    setProgressMsg("");
    setData(result);
    done();

    return result;
  } catch (e) {
    console.debug(e);
  }
};

self.onmessage = ({ data }) => calculateProfits(data, self);

function getMeta(
  meta: ApiResult<{ [key: string]: number }>,
  Vaal: boolean,
  Type: GemType,
  name: string
) {
  if (meta.status !== "done") {
    return 0;
  } else if (Vaal && Type !== "Superior") {
    return (
      Math.min(meta.value[name.replace("Vaal ", "")], meta.value[name.replace(Type + " ", "")]) || 0
    );
  } else {
    return meta.value[name] || 0;
  }
}
