import RefreshIcon from "@mui/icons-material/Refresh";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingFn,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { cache } from "apis/axios";
import { getGemQuality as getGemInfo } from "apis/getGemQuality";
import { EditOverride } from "components/Override";
import { League } from "models/ninja/Leagues";
import numeral from "numeral";
import React, { useEffect, useMemo, useReducer, useState } from "react";
import GithubCorner from "react-github-corner";
import {
  getAwakenedLevelAverage,
  getAwakenedRerollAverage,
  getTempleAverage,
} from "./apis/getAveragePrice";
import { getCurrencyOverview } from "./apis/getCurrencyOverview";
import { getGemOverview } from "./apis/getGemOverview";
import { getLeagues } from "./apis/getLeagues";
import { getMeta } from "./apis/getMeta";
import "./App.css";
import Filter from "./components/Filter";
import { forEach } from "./functions/forEach";
import { useAsync } from "./functions/useAsync";
import useDebouncedState from "./functions/useDebouncedState";
import {
  altQualities,
  bestMatch,
  betterOrEqual,
  compareGem,
  ConversionData,
  copy,
  exceptional,
  exists,
  Gem,
  GemDetails,
  getQuery,
  getRatios,
  getType,
  isEqual,
  mavenCrucible,
  mavenExclusive,
  modifiers,
  Override,
  strictlyBetter,
  vaal,
} from "./models/Gems";

const million = 1000000;

const includes: FilterFn<GemDetails> = (row, columnId, filterValue: any[]) =>
  (filterValue?.length || 0) === 0 || filterValue.includes(row.getValue(columnId));

function App() {
  const [showOptions, setShowOptions] = useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [league, setLeague] = useState<League>();
  const [sanitize, setSanitize] = useState<"no" | "yes" | "corrupted">("yes");
  const templePrice = useDebouncedState(0);
  const awakenedLevelPrice = useDebouncedState(0);
  const awakenedRerollPrice = useDebouncedState(0);
  const mavenExclusiveWeight = useDebouncedState(90);
  const mavenCrucibleWeight = useDebouncedState(500);
  const primeRegrading = useDebouncedState(0);
  const secRegrading = useDebouncedState(0);
  const filterMeta = useDebouncedState(0.2);
  const incQual = useDebouncedState(30);
  const fiveWay = useDebouncedState(100);
  const [lowConfidence, setLowConfidence] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [load, reload] = useReducer((current) => current + 1, 0);

  const gemInfo = useAsync(getGemInfo);
  const leagues = useAsync(getLeagues, [load]);
  const meta = useAsync(league?.indexed ? getMeta : undefined, [load], league?.name || "");
  const gems = useAsync(league ? getGemOverview : undefined, [load], league?.name || "");
  const currencyMap = useAsync(
    league ? getCurrencyOverview : undefined,
    [load],
    league?.name || ""
  );
  const templeAverage = useAsync(
    currencyMap.done ? getTempleAverage : undefined,
    [load],
    league?.name || "",
    currencyMap.done ? currencyMap.value : () => 1
  );
  const awakenedLevelAverage = useAsync(
    currencyMap.done ? getAwakenedLevelAverage : undefined,
    [load],
    league?.name || "",
    currencyMap.done ? currencyMap.value : () => 1
  );
  const awakenedRerollAverage = useAsync(
    currencyMap.done ? getAwakenedRerollAverage : undefined,
    [load],
    league?.name || "",
    currencyMap.done ? currencyMap.value : () => 1
  );
  const costOfTemple =
    templePrice.debounced || (templeAverage.done && templeAverage.value.price) || 100;
  const costOfAwakenedLevel =
    awakenedLevelPrice.debounced ||
    (awakenedLevelAverage.done && awakenedLevelAverage.value.price) ||
    30;
  const costOfAwakenedReroll =
    awakenedRerollPrice.debounced ||
    (awakenedRerollAverage.done && awakenedRerollAverage.value.price) ||
    250;
  const [data, setData] = useState([] as GemDetails[]);

  const [overrides, setOverride] = useReducer<(state: Override[], action: Override) => Override[]>(
    (state, update) => {
      let found = false;
      const mapped = state.map((o) => {
        if (isEqual(o.original, update.original)) {
          found = true;
          return update;
        } else {
          return o;
        }
      });
      if (!found) {
        mapped.push(update);
      }
      return mapped;
    },
    []
  );

  useEffect(() => {
    if (!gems.done || !currencyMap.done || (league?.indexed && !meta.done) || !gemInfo.done) {
      return;
    }
    let cancel = false;
    let timeout: NodeJS.Timeout;

    setProgressMsg("Formatting data");

    const missingXP: { [gem: string]: true } = {};
    (async () => {
      const vaalGems: { [key: string]: boolean } = {};
      let result: GemDetails[] = gems.value.map(
        ({
          name,
          variant,
          chaosValue,
          gemLevel,
          gemQuality,
          corrupted,
          listingCount,
          sparkline,
        }) => {
          const baseName = modifiers.reduce((name, mod) => name.replace(mod, ""), name);
          const Vaal = name.includes("Vaal");
          const Type = getType(name);
          const Meta = (meta.done && meta.value[name]) || 0;
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
              Meta < filterMeta.debounced ||
              !sparkline?.data?.length ||
              sparkline.data[sparkline.data.length - 1] === null,
          } as GemDetails;
        }
      );

      result = result.map((gem) => {
        const update = overrides.find((o) => isEqual(gem, o.original));
        if (update) {
          return copy(gem, update.override);
        } else {
          return gem;
        }
      });

      const gemMap: { [key: string]: { [key: string]: Gem[] } } = {};
      result.forEach((gem) => {
        gem.canVaal = vaalGems[gem.baseName];
        if (!gemMap[gem.baseName]) gemMap[gem.baseName] = {};
        if (!gemMap[gem.baseName][gem.Type]) gemMap[gem.baseName][gem.Type] = [];
        gemMap[gem.baseName][gem.Type].push(gem);
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
      await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
      const processingTime = 400;
      let timeSlice = Date.now() + processingTime;

      const oneGcp = currencyMap.value?.("Gemcutter's Prism") || 1;

      await forEach(result, async (gem, i) => {
        if (cancel) throw new Error("cancel");
        if (Date.now() > timeSlice) {
          const p = (100 * i) / result.length;
          setProgress(p);
          console.debug("yielding to ui", Date.now() - timeSlice);
          await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
          console.debug("resumed processing", Date.now() - timeSlice);
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
      });

      setData(structuredClone(result));
      setProgressMsg("Calculating xp values");
      setProgress(0);
      await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
      timeSlice = Date.now() + processingTime;

      await forEach(result, async (gem, i) => {
        if (cancel) throw new Error("cancel");
        if (Date.now() > timeSlice) {
          const p = (100 * i) / result.length;
          setProgress(p);
          console.debug("yielding to ui", Date.now() - timeSlice);
          await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
          console.debug("resumed processing", Date.now() - timeSlice);
          timeSlice = Date.now() + processingTime;
        }

        //XP
        if (gem.XP !== undefined) {
          const qualityMultiplier =
            !altQualities.includes(gem.Type as any) && exceptional.find((e) => gem.Name.includes(e))
              ? 1 + (gem.Quality + incQual.debounced) * 0.05
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

                      return {
                        ...other,
                        gcpCount: 1,
                        gcpCost: oneGcp,
                        reset: true,
                        xpDiff,
                        xpValue: (other.Price - (gem.Price + oneGcp)) / xpDiff,
                      };
                    })
                : []
            )
            .filter(exists)
            .sort((a, b) => b.xpValue - a.xpValue);
          gem.xpValue = gem.xpData[0]?.xpValue || 0;
        }
      });

      setData(structuredClone(result));
      setProgressMsg("Calculating Wild Brambleback values");
      setProgress(0);
      await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
      timeSlice = Date.now() + processingTime;

      await forEach(result, async (gem, i) => {
        if (cancel) throw new Error("cancel");
        if (Date.now() > timeSlice) {
          const p = (100 * i) / result.length;
          setProgress(p);
          console.debug("yielding to ui", Date.now() - timeSlice);
          await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
          console.debug("resumed processing", Date.now() - timeSlice);
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
      });

      setData(structuredClone(result));
      setProgressMsg("Calculating Vivid Watcher values");
      setProgress(0);
      await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
      timeSlice = Date.now() + processingTime;

      await forEach(result, async (gem, i) => {
        if (cancel) throw new Error("cancel");
        if (Date.now() > timeSlice) {
          const p = (100 * i) / result.length;
          setProgress(p);
          console.debug("yielding to ui", Date.now() - timeSlice);
          await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
          console.debug("resumed processing", Date.now() - timeSlice);
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
            exclusive.length * mavenExclusiveWeight.debounced +
            crucible.length * mavenCrucibleWeight.debounced;
          if (exclusive.length + crucible.length === mavenExclusive.length + mavenCrucible.length) {
            console.warn(gem.Name + " not recognized");
          }
          const convData = exclusive
            .map((Name) => ({
              chance: mavenExclusiveWeight.debounced / totalWeight,
              gem: bestMatch(
                copy(gem, { Name, baseName: Name, Price: 0, Listings: 0 }),
                gemMap[Name]?.[gem.Type],
                lowConfidence
              ),
            }))
            .concat(
              crucible.map((Name) => ({
                chance: mavenCrucibleWeight.debounced / totalWeight,
                gem: bestMatch(
                  copy(gem, { Name, baseName: Name, Price: 0, Listings: 0 }),
                  gemMap[Name]?.[gem.Type],
                  lowConfidence
                ),
              }))
            );
          gem.convertValue =
            (convData?.reduce(
              (sum, { gem: { Price }, chance }) => sum + (Price || 0) * chance,
              0
            ) || 0) - gem.Price;
        }
      });

      setData(structuredClone(result));
      setProgressMsg("Calculating regrading lens values");
      setProgress(0);
      await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
      timeSlice = Date.now() + processingTime;
      const missingQual = {} as { [baseName: string]: true };

      if (gemInfo.done) {
        await forEach(result, async (gem, i) => {
          if (cancel) throw new Error("cancel");
          if (Date.now() > timeSlice) {
            const p = (100 * i) / result.length;
            setProgress(p);
            console.debug("yielding to ui", Date.now() - timeSlice);
            await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
            console.debug("resumed processing", Date.now() - timeSlice);
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
              gem: bestMatch(
                copy(gem, { Type, Price: 0, Listings: 0 }),
                gemMap[gem.baseName][Type],
                lowConfidence
              ),
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
        });
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
      await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
      timeSlice = Date.now() + processingTime;

      await forEach(result, async (gem, i) => {
        if (cancel) throw new Error("cancel");
        if (Date.now() > timeSlice) {
          const p = (100 * i) / result.length;
          setProgress(p);
          console.debug("yielding to ui", Date.now() - timeSlice);
          await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
          console.debug("resumed processing", Date.now() - timeSlice);
          timeSlice = Date.now() + processingTime;
        }

        //Corruption
        if (!gem.Corrupted) {
          const vaalData = vaal(gem).map((v) => ({
            ...v,
            gem: bestMatch(
              copy(v.gem, { Price: 0, Listings: 0 }),
              gemMap[v.gem.baseName][v.gem.Type],
              lowConfidence
            ),
          }));
          gem.vaalValue =
            (vaalData?.reduce((sum, { gem, chance }) => sum + (gem?.Price || 0) * chance, 0) || 0) -
              gem.Price -
              currencyMap.value?.("Vaal Orb") || 1;
          let merged: ConversionData | null = null;
          let sumChance = 0;
          gem.vaalData = [];
          vaalData.forEach((next) => {
            sumChance += next.chance;
            if (merged === null) {
              merged = { ...next };
            } else if (merged.gem === next.gem && merged.outcomes[0] === next.outcomes[0]) {
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
      });

      setData(structuredClone(result));
      setProgressMsg("Calculating temple corruption outcomes");
      setProgress(0);
      await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
      timeSlice = Date.now() + processingTime;

      await forEach(result, async (gem, i) => {
        if (cancel) throw new Error("cancel");
        if (Date.now() > timeSlice) {
          const p = (100 * i) / result.length;
          setProgress(p);
          console.debug("yielding to ui", Date.now() - timeSlice);
          await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
          console.debug("resumed processing", Date.now() - timeSlice);
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
              gem: bestMatch(
                copy(v.gem, { Price: 0, Listings: 0 }),
                gemMap[v.gem.baseName][v.gem.Type],
                lowConfidence
              ),
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
            (gem.templeData?.reduce(
              (sum, { gem, chance }) => sum + (gem?.Price || 0) * chance,
              0
            ) || 0) - gem.Price;
        } else {
          gem.templeValue = 0;
        }
      });

      if (cancel) return;
      setProgress(100);
      setProgressMsg("");
      setData(result);
    })().catch((e: Error) => {
      if (e.message !== "cancel") console.error(e);
    });

    return () => {
      cancel = true;
      clearTimeout(timeout);
      setProgress(0);
    };
  }, [
    gems,
    overrides,
    meta,
    currencyMap,
    gemInfo,
    incQual.debounced,
    lowConfidence,
    league?.indexed,
    sanitize,
    filterMeta.debounced,
    mavenCrucibleWeight.debounced,
    mavenExclusiveWeight.debounced,
  ]);

  const columns: ColumnDef<GemDetails, GemDetails[keyof GemDetails]>[] = useMemo(
    () => [
      {
        accessorKey: "Name",
        filterFn: "includesString",
        cell: (info) => (
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://www.pathofexile.com/trade/search/${league?.name}?q=${JSON.stringify(
              getQuery(info.row.original)
            )}`}>
            {info.getValue() as string}
          </a>
        ),
      },
      {
        accessorKey: "Corrupted",
        filterFn: "equals",
        cell: (info) => (info.getValue() ? "???" : "???"),
      },
      { accessorKey: "Level", filterFn: "inNumberRange" },
      { accessorKey: "Quality", filterFn: "inNumberRange" },
      { accessorKey: "Type", filterFn: "includes" as any },
      {
        accessorKey: "Price",
        filterFn: "inNumberRange",
        cell: ({ row: { original } }) => (
          <EditOverride
            original={original}
            override={overrides.find((o) => isEqual(original, o.original))}
            setOverride={setOverride}
            numField="Price"
            endAdornment="c"
          />
        ),
      },
      {
        accessorKey: "XP",
        sortingFn: (({ original: { XP: a } }, { original: { XP: b } }) =>
          a === b
            ? 0
            : a === undefined
            ? -1
            : b === undefined
            ? 1
            : a - b) as SortingFn<GemDetails>,
        filterFn: "inNumberRange",
        cell: (info) =>
          Number.isInteger(info.getValue())
            ? numeral((info.getValue() as number).toPrecision(3)).format("0[.][00]a")
            : "n/a",
      },
      {
        id: "xpValue",
        accessorFn: ({ xpValue }) => xpValue * fiveWay.debounced,
        header: "Levelling",
        sortingFn: (({ original: { xpValue: a } }, { original: { xpValue: b } }) =>
          a === b
            ? 0
            : a === undefined
            ? -1
            : b === undefined
            ? 1
            : a - b) as SortingFn<GemDetails>,
        filterFn: "inNumberRange",
        cell: ({
          row: {
            original: { xpData },
          },
        }) =>
          !xpData?.length ? (
            "n/a"
          ) : (
            <span
              title={xpData
                ?.map(
                  ({ xpValue, Level, Quality, Price, gcpCount, reset }, i) =>
                    `${Math.round(xpValue * fiveWay.debounced)}c/5-way${
                      reset ? "" : gcpCount === 0 ? "" : ` applying ${gcpCount} gcp and`
                    } levelling this gem to ${Level}/${Quality} (${Price}c)${
                      reset ? " with vendor reset" : ""
                    }`
                )
                .join("\n")}>
              {Math.round(xpData[0].xpValue * fiveWay.debounced)}c/5-way (
              {numeral(xpData[0].xpDiff / fiveWay.debounced).format("0[.][00]")} 5-ways)
            </span>
          ),
      },
      {
        id: "xpRatio",
        accessorFn: ({ xpValue, Price }) => (xpValue ? (xpValue * fiveWay.debounced) / Price : 0),
        header: "Levelling ratio",
        sortingFn: ((left, right) => {
          const a: number = left.getValue("xpRatio");
          const b: number = right.getValue("xpRatio");
          return a === b ? 0 : a === undefined ? -1 : b === undefined ? 1 : a - b;
        }) as SortingFn<GemDetails>,
        filterFn: "inNumberRange",
        cell: (info) =>
          isNaN(info.getValue() as any)
            ? "n/a"
            : numeral((info.getValue() as number).toPrecision(3)).format("0[.][00]a"),
      },
      {
        id: "ratio",
        header: "Best ratio",
        accessorFn: (original) =>
          getRatios(
            original,
            currencyMap.value || (() => 1),
            costOfTemple,
            costOfAwakenedLevel,
            costOfAwakenedReroll
          )[0]?.ratio,
        cell: ({ row: { original } }) => {
          const ratios = getRatios(
            original,
            currencyMap.value || (() => 1),
            costOfTemple,
            costOfAwakenedLevel,
            costOfAwakenedReroll
          );
          return ratios?.length ? (
            <span
              title={ratios
                .map(
                  ({ name, ratio, profit, cost }) =>
                    `${name}: ${numeral(ratio).format("0[.][00]")} (cost: ${numeral(cost).format(
                      "0[.][00]"
                    )}c, profit: ${numeral(profit).format("0[.][00]")}c)`
                )
                .join("\n")}>
              {numeral(ratios[0].ratio).format("0[.][00]")}
            </span>
          ) : (
            "n/a"
          );
        },
      },
      {
        accessorKey: "gcpValue",
        header: "GCP",
        filterFn: "inNumberRange",
        sortingFn: (a, b) =>
          (a.original.gcpData?.[0]?.gcpValue || 0) - (b.original.gcpData?.[0]?.gcpValue || 0),
        cell: ({
          row: {
            original: { gcpData },
          },
        }) =>
          !gcpData?.length ? (
            "n/a"
          ) : (
            <span
              title={gcpData
                ?.map(
                  ({ gcpValue, Level, Quality, Listings, Price }, i) =>
                    `Earn ${numeral(gcpValue).format(
                      "0[.][00]"
                    )}c upgrading this gem to ${Level}/${Quality} (${Listings} listed at ${Price}c)`
                )
                .join("\n")}>
              {Math.round(gcpData[0].gcpValue)}
            </span>
          ),
      },
      {
        id: "regrValue",
        accessorFn: ({ regrValue, Name }) =>
          (regrValue || 0) -
          (currencyMap.value?.(
            Name.includes("Support") ? "Secondary Regrading Lens" : "Prime Regrading Lens"
          ) || 0),
        header: "Regrading",
        filterFn: "inNumberRange",
        cell: ({
          row: {
            original: { Name, Price, regrValue, regrData },
          },
        }) =>
          !regrData?.length ? (
            "n/a"
          ) : (
            <span
              title={regrData
                ?.map(
                  ({ gem, chance }) =>
                    `${numeral(chance * 100).format("0[.][00]")}% ${Math.round(
                      gem.Price -
                        Price -
                        (currencyMap.value?.(
                          Name.includes("Support")
                            ? "Secondary Regrading Lens"
                            : "Prime Regrading Lens"
                        ) || 0)
                    )}c: ${gem.Level}/${gem.Quality} ${gem.Name} (${
                      gem.Price ? `${gem.Listings} at ${gem.Price}c` : "low confidence"
                    })`
                )
                .join("\n")}>
              {Math.round(
                (regrValue || 0) -
                  (currencyMap.value?.(
                    Name.includes("Support") ? "Secondary Regrading Lens" : "Prime Regrading Lens"
                  ) || 0)
              )}
            </span>
          ),
      },
      {
        accessorKey: "vaalValue",
        header: "Vaal",
        filterFn: "inNumberRange",
        cell: ({
          row: {
            original: { vaalValue, vaalData },
          },
        }) =>
          vaalValue ? (
            <span
              title={vaalData
                ?.map(
                  ({ gem, chance, outcomes: [outcome] }) =>
                    `${numeral(chance * 100).format("0[.][00]")}% ${outcome}: ${gem.Level}/${
                      gem.Quality
                    }${
                      gem.Listings === 0 &&
                      (outcome === "Add quality" || outcome === "Remove quality")
                        ? "+"
                        : ""
                    } ${gem.Name} (${
                      gem.Price ? `${gem.Listings} at ${gem.Price}c` : "low confidence"
                    })`
                )
                .join("\n")}>
              {Math.round(vaalValue)}c
            </span>
          ) : (
            "n/a"
          ),
      },
      {
        id: "templeValue",
        accessorFn: ({ templeValue }) => templeValue && templeValue - costOfTemple,
        header: "Temple",
        filterFn: "inNumberRange",
        cell: ({
          row: {
            original: { templeValue, templeData },
          },
        }) =>
          templeValue ? (
            <span
              title={templeData
                ?.map(
                  ({ gem, chance }) =>
                    `${numeral(chance * 100).format("0[.][00]")} %: ${gem.Level} / ${gem.Quality} ${
                      gem.Name
                    } (${gem.Price ? `${gem.Listings} at ${gem.Price}c` : "low confidence"})`
                )
                .join("\n")}>
              {Math.round(templeValue - costOfTemple)}c
            </span>
          ) : (
            "n/a"
          ),
      },
      {
        id: "levelValue",
        accessorFn: ({ levelValue }) => levelValue - costOfAwakenedLevel,
        header: "Wild Brambleback",
        sortingFn: (({ original: { levelValue: a } }, { original: { levelValue: b } }) =>
          a === b
            ? 0
            : a === undefined
            ? -1
            : b === undefined
            ? 1
            : a - b) as SortingFn<GemDetails>,
        filterFn: "inNumberRange",
        cell: ({
          row: {
            original: { levelData },
          },
        }) =>
          !levelData?.length ? (
            "n/a"
          ) : (
            <span
              title={levelData
                ?.map(
                  ({ levelValue, levelDiff, Level, Quality, Price, gcpCount }, i) =>
                    `${Math.round(levelValue - costOfAwakenedLevel)}c profit/level applying${
                      gcpCount === 0 ? "" : ` ${gcpCount} gcp and`
                    } ${levelDiff} Wild Brambleback to ${Level}/${Quality} (${Price}c)`
                )
                .join("\n")}>
              {Math.round(levelData[0].levelValue)}c/level
            </span>
          ),
      },
      {
        id: "convertValue",
        accessorFn: ({ convertValue }) => convertValue && convertValue - costOfAwakenedReroll,
        header: "Vivid Watcher",
        sortingFn: (({ original: { convertValue: a } }, { original: { convertValue: b } }) =>
          a === b
            ? 0
            : a === undefined
            ? -1
            : b === undefined
            ? 1
            : a - b) as SortingFn<GemDetails>,
        filterFn: "inNumberRange",
        cell: ({
          row: {
            original: { convertValue },
          },
        }) => (convertValue ? Math.round(convertValue - costOfAwakenedReroll) : "n/a"),
      },
      {
        accessorKey: "Meta",
        filterFn: "inNumberRange",
        enableColumnFilter: !!league?.indexed,
        cell: ({
          row: {
            original: { Meta, Name: Gem },
          },
        }) =>
          Meta ? (
            <a
              href={`https://poe.ninja/${league?.url}/builds?allskill=${Gem.replaceAll(" ", "-")}`}
              target="_blank"
              rel="noreferrer">
              {Meta} %
            </a>
          ) : (
            "n/a"
          ),
      },
      {
        accessorKey: "Listings",
        filterFn: "inNumberRange",
        cell: ({
          row: {
            original: { Listings, Name: Gem },
          },
        }) => (
          <a
            href={`https://poe.ninja/${league?.url}/skill-gems?name=${Gem}`}
            target="_blank"
            rel="noreferrer">
            {Listings}
          </a>
        ),
      },
      {
        accessorKey: "lowConfidence",
        header: "Low confidence",
        filterFn: "equals",
        cell: (info) => (info.getValue() ? "???" : "???"),
      },
    ],
    [
      overrides,
      league,
      currencyMap,
      fiveWay.debounced,
      costOfTemple,
      costOfAwakenedLevel,
      costOfAwakenedReroll,
    ]
  );

  const table = useReactTable({
    data,
    columns,
    filterFns: { includes },
    enablePinning: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility: { Meta: !!league?.indexed },
      columnPinning: { left: ["Name"] },
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}>
      <GithubCorner href="https://github.com/lvlvllvlvllvlvl/poetrage" target="_blank" />
      <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          <Accordion
            style={{ flex: 1 }}
            expanded={!league || showOptions}
            onChange={(_, show) => setShowOptions(show)}>
            <AccordionSummary>
              <Typography component="h1" variant="h5" gutterBottom>
                poetrage
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl fullWidth margin="normal">
                <InputLabel>League</InputLabel>
                <Select
                  value={leagues.done && league ? league?.name : ""}
                  label="league"
                  onChange={({ target }) =>
                    setLeague(
                      leagues.value?.economyLeagues?.find(({ name }) => name === target.value)
                    )
                  }>
                  {leagues.pending && !league && (
                    <MenuItem value="" disabled>
                      Loading leagues...
                    </MenuItem>
                  )}
                  {!leagues.pending && !league && (
                    <MenuItem value="" disabled>
                      Select a league
                    </MenuItem>
                  )}
                  {leagues.done &&
                    leagues.value.economyLeagues.map((league) => (
                      <MenuItem key={league.name} value={league.name}>
                        {league.displayName}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              {leagues.fail && String(leagues.error)}

              {!league ? undefined : (
                <>
                  <TextField
                    type="number"
                    fullWidth
                    margin="normal"
                    label="Override temple price"
                    variant="outlined"
                    value={templePrice.value || ""}
                    onChange={({ target }) =>
                      templePrice.set(target.value ? parseInt(target.value) : 0)
                    }
                  />
                  <p>
                    <a
                      href={
                        templeAverage.done
                          ? `https://www.pathofexile.com/trade/search/${league.name}/${templeAverage.value.searchId}`
                          : undefined
                      }
                      target="_blank"
                      rel="noreferrer">
                      {templeAverage.done
                        ? templeAverage.value.total
                          ? `Estimated Doryani's Institute price: ${templeAverage.value.price} chaos (${templeAverage.value.total} listings, used ${templeAverage.value.filtered} of first ${templeAverage.value.pageSize} results)`
                          : "No Doryani's Institute online"
                        : templeAverage.error
                        ? "Error getting temple prices"
                        : "Checking temple prices..."}
                    </a>
                  </p>

                  <TextField
                    type="number"
                    fullWidth
                    margin="normal"
                    label="Prime regrading lens price"
                    placeholder={Math.round(
                      currencyMap.value?.("Prime Regrading Lens") || 0
                    ).toString()}
                    variant="outlined"
                    value={primeRegrading.value || ""}
                    onChange={({ target }) =>
                      primeRegrading.set(target.value ? parseInt(target.value) : 0)
                    }
                  />

                  <TextField
                    type="number"
                    fullWidth
                    margin="normal"
                    label="Secondary regrading lens price"
                    placeholder={Math.round(
                      currencyMap.value?.("Secondary Regrading Lens") || 0
                    ).toString()}
                    variant="outlined"
                    value={secRegrading.value || ""}
                    onChange={({ target }) =>
                      secRegrading.set(target.value ? parseInt(target.value) : 0)
                    }
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={lowConfidence}
                        onChange={(_, checked) => setLowConfidence(checked)}
                      />
                    }
                    label="include low confidence values"
                  />

                  <TextField
                    type="number"
                    fullWidth
                    margin="normal"
                    label="Exclude gems with less meta % than"
                    variant="outlined"
                    value={filterMeta.value || 0}
                    onChange={({ target }) =>
                      filterMeta.set(target.value ? parseFloat(target.value) : 0)
                    }
                  />

                  <FormControl fullWidth margin="normal">
                    <InputLabel>Mark inconsistently priced gems as low confidence</InputLabel>
                    <Select
                      value={sanitize}
                      label="Mark inconsistently priced gems as low confidence"
                      onChange={({ target }) => setSanitize(target.value as any)}>
                      <MenuItem value="no">No</MenuItem>
                      <MenuItem value="yes">Yes</MenuItem>
                      <MenuItem value="corrupted">Corruption outcomes only</MenuItem>
                    </Select>
                    <FormHelperText>
                      e.g. 20/20 corrupted worth more than 20/20 uncorrupted
                    </FormHelperText>
                  </FormControl>

                  <TextField
                    type="number"
                    fullWidth
                    margin="normal"
                    label="Gem quality bonus"
                    variant="outlined"
                    value={incQual.value}
                    onChange={({ target }) =>
                      incQual.set(target.value ? parseInt(target.value) : 0)
                    }
                    helperText="Disfavour/Dialla/Replica Voideye: 30, Cane of Kulemak 8-15, veiled: 9-10, crafted: 7-8"
                  />

                  <TextField
                    type="number"
                    fullWidth
                    margin="normal"
                    label="Million XP per 5-way"
                    variant="outlined"
                    value={fiveWay.value}
                    onChange={({ target }) =>
                      fiveWay.set(target.value ? parseInt(target.value) : 0)
                    }
                  />
                </>
              )}
            </AccordionDetails>
          </Accordion>
          <IconButton
            onClick={async () => {
              ((await cache).store as LocalForage).clear();
              reload();
            }}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {!league ? undefined : (
          <>
            <Typography component="p" p={1}>
              {gems.pending || currencyMap.pending || meta.pending || gemInfo.pending
                ? "Fetching data..."
                : progressMsg || "All currency costs accounted for in profit values"}
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </>
        )}
      </Container>
      {gemInfo.error && <Alert severity="error">Error getting gem details: {gemInfo.error}</Alert>}
      {gems.error && <Alert severity="error">Error getting gem prices: {gems.error}</Alert>}
      {currencyMap.error && (
        <Alert severity="error">Error getting currency values: {currencyMap.error}</Alert>
      )}
      {meta.error && <Alert severity="error">Error getting metagame: {meta.error}</Alert>}
      {gems.done && currencyMap.done && (
        <>
          <Box sx={{ maxWidth: "100vw", overflow: "auto" }}>
            <Table sx={{ minWidth: `${(columns.length - (league?.indexed ? 1 : 0)) * 11}em` }}>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableCell
                          key={header.id}
                          colSpan={header.colSpan}
                          sx={{
                            height: 0,
                            background: "white",
                            position: header.column.getIsPinned() ? "sticky" : undefined,
                            left: header.column.getIsPinned() ? 0 : undefined,
                            zIndex: header.column.getIsPinned() ? 1000 : undefined,
                          }}>
                          {header.isPlaceholder ? null : (
                            <Box
                              sx={{
                                flex: "1",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                              }}>
                              <Box
                                {...{
                                  style: header.column.getCanSort()
                                    ? {
                                        cursor: "pointer",
                                        userSelect: "none",
                                        verticalAlign: "top",
                                      }
                                    : { verticalAlign: "top" },
                                  onClick: header.column.getToggleSortingHandler(),
                                }}>
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {{ asc: " ???", desc: " ???" }[header.column.getIsSorted() as string] ??
                                  null}
                              </Box>
                              {header.column.getCanFilter() ? (
                                <Filter column={header.column as any} />
                              ) : null}
                            </Box>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {table.getRowModel().rows.map((row) => {
                  return (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <TableCell
                            key={cell.id}
                            sx={{
                              background: "white",
                              position: cell.column.getIsPinned() ? "sticky" : undefined,
                              left: cell.column.getIsPinned() ? 0 : undefined,
                              zIndex: cell.column.getIsPinned() ? 1000 : undefined,
                            }}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
          <Pagination
            count={table.getPageCount()}
            page={table.getState().pagination.pageIndex + 1}
            onChange={(_, page) => table.setPageIndex(page - 1)}
          />
        </>
      )}
      {gems.fail && String(gems.error)}
    </Box>
  );
}

export default App;
