/* eslint-disable no-restricted-globals */
import {
  ConversionData,
  Gem,
  GemDetails,
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
  strictlyBetter,
  vaal,
} from "models/Gems";
import { ProfitInputs } from "redux/selectors/profitInputs";

export const getCurrency = (currency: string, map?: { [key: string]: number }, fallback = 1) => {
  return (
    map?.[currency] ||
    map?.[
      Object.keys(map)
        .filter((k) => k.toLowerCase().includes(currency))
        .reduce((a, b) => (!a ? b : !b ? a : a.length <= b.length ? a : b), "") || ""
    ] ||
    fallback
  );
};

const million = 1000000;

self.onmessage = (e: MessageEvent<{ inputs: ProfitInputs; cancel: URL }>) => {
  try {
    const [
      gems,
      currencyMap,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    ] = e.data.inputs;

    if (
      gems.status !== "done" ||
      currencyMap.status !== "done" ||
      (leagueIsIndexed && meta.status !== "done") ||
      gemInfo.status !== "done"
    ) {
      return;
    }

    const checkToken = () => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", e.data.cancel, false);
      xhr.send(null);
    };
    const setData = (payload: GemDetails[]) => {
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

    setProgressMsg("Formatting data");

    const missingXP: { [gem: string]: true } = {};
    const vaalGems: { [key: string]: boolean } = {};
    let result: GemDetails[] = gems?.value.map(
      ({ name, variant, chaosValue, gemLevel, gemQuality, corrupted, listingCount, sparkline }) => {
        const baseName = modifiers.reduce((name, mod) => name.replace(mod, ""), name);
        const Vaal = name.includes("Vaal");
        const Type = getType(name);
        const Meta = (meta.status === "done" && meta.value[name]) || 0;
        const levels = gemInfo.value?.xp[Type === "Awakened" ? name : baseName];
        if (!levels) {
          missingXP[Type === "Awakened" ? name : baseName] = true;
        }
        vaalGems[baseName] = vaalGems[baseName] || Vaal;
        return {
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
          lowConfidence:
            Meta < filterMeta ||
            !sparkline?.data?.length ||
            sparkline.data[sparkline.data.length - 1] === null,
        } as GemDetails;
      }
    );

    result = result
      .map((gem) => {
        const update = overrides.find((o) => o.original && isEqual(gem, o.original));
        if (update) {
          return copy(gem, update.override);
        } else {
          return gem;
        }
      })
      .concat(overrides.filter((o) => !o.original).map((o) => o.override as GemDetails));

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

    //Mark gems that are priced higher than strictly better versions of the same gem as low confidence
    result.forEach((gem) => {
      gemMap[gem.baseName][gem.Type].forEach((other) => {
        if (
          (sanitize === "yes" || (sanitize === "corrupted" && gem.Corrupted)) &&
          !gem.lowConfidence &&
          !gem.isOverride &&
          other.Price < gem.Price &&
          strictlyBetter(other, gem)
        ) {
          console.debug(
            `${gem.Name} ${gem.variant} (${gem.Price} chaos) worth more than ${other.variant} (${other.Price} chaos), marking low confidence`
          );
          gem.lowConfidence = true;
        }
      });
    });

    setData(structuredClone(result));
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
              (lowConfidence || !other.lowConfidence) &&
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

    setData(structuredClone(result));
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

                    return copy({
                      ...other,
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

    setData(structuredClone(result));
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

    setData(structuredClone(result));
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
        const convData = exclusive
          .map((Name) => ({
            chance: mavenExclusiveWeight / totalWeight,
            gem: bestMatch(
              copy(gem, { Name, baseName: Name }),
              gemMap[Name]?.[gem.Type],
              lowConfidence
            ),
          }))
          .concat(
            crucible.map((Name) => ({
              chance: mavenCrucibleWeight / totalWeight,
              gem: bestMatch(
                copy(gem, { Name, baseName: Name }),
                gemMap[Name]?.[gem.Type],
                lowConfidence
              ),
            }))
          );
        gem.convertValue =
          (convData?.reduce((sum, { gem: { Price }, chance }) => sum + (Price || 0) * chance, 0) ||
            0) - gem.Price;
      }
    }

    setData(structuredClone(result));
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
      console.debug(
        `Missing alt quality data, visit https://www.poewiki.net/wiki/${missing.replaceAll(
          " ",
          "_"
        )}/edit, save without changing anything and then purge cache.`
      );
    }

    setData(structuredClone(result));
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
            if (
              next.gem.Name === "Divergent Tornado Shot" &&
              merged.gem.Quality === 23 &&
              merged.gem.Level === 20
            ) {
              console.log(next.gem, merged.gem);
            }
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

    setData(structuredClone(result));
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
            merged = { ...next };
          } else if (
            merged.gem === next.gem ||
            (betterOrEqual(merged.gem, next.gem) && betterOrEqual(next.gem, merged.gem))
          ) {
            merged.chance += next.chance;
          } else if (
            merged.gem.Listings === 0 &&
            next.gem.Listings === 0 &&
            !merged.outcomes.find(
              (v, i) => v !== "Remove quality" && v !== "Add quality" && v !== next.outcomes[i]
            ) &&
            !next.outcomes.find(
              (v, i) => v !== "Remove quality" && v !== "Add quality" && v !== merged?.outcomes[i]
            )
          ) {
            merged.chance += next.chance;
            merged.gem = copy(merged.gem, {
              Quality: Math.min(merged.gem.Quality, next.gem.Quality),
            });
          } else {
            gem.templeData?.push(merged);
            merged = { ...next };
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
  } catch (e) {
    console.debug(e);
  }
};
