import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  InputLabel,
  LinearProgress,
  MenuItem,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
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
import { League } from "models/ninja/Leagues";
import numeral from "numeral";
import React, { useEffect, useMemo, useReducer, useState } from "react";
import { getCurrencyOverview as getCurrencyMap } from "./apis/getCurrencyOverview";
import { getExp } from "./apis/getExp";
import { getGemOverview } from "./apis/getGemOverview";
import { getLeagues } from "./apis/getLeagues";
import { getMeta } from "./apis/getMeta";
import { getTempleAverage } from "./apis/getTempleAverage";
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
  copy,
  exceptional,
  exists,
  Gem,
  GemDetails,
  getType,
  modifiers,
  vaal,
  VaalData,
} from "./models/Gems";

const million = 1000000;
const basicCurrency = { "Chaos Orb": 1 };

const includes: FilterFn<GemDetails> = (row, columnId, filterValue: any[]) =>
  (filterValue?.length || 0) > 0 && filterValue.includes(row.getValue(columnId));

function App() {
  const [showOptions, setShowOptions] = useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [league, setLeague] = useState<League>();
  const templePrice = useDebouncedState(0);
  const incQual = useDebouncedState(30);
  const fiveWay = useDebouncedState(60);
  const [lowConfidence, setLowConfidence] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [fetch, refetch] = useReducer((current) => current + 1, 0);

  const leagues = useAsync(getLeagues, [fetch]);
  const xp = useAsync(getExp);
  const meta = useAsync(league?.indexed ? getMeta : undefined, [fetch], league?.name || "");
  const gems = useAsync(league ? getGemOverview : undefined, [fetch], league?.name || "");
  const currencyMap = useAsync(league ? getCurrencyMap : undefined, [fetch], league?.name || "");
  const templeAverage = useAsync(
    currencyMap.done ? getTempleAverage : undefined,
    [fetch],
    league?.name || "",
    currencyMap.done ? currencyMap.value : basicCurrency
  );
  const [data, setData] = useState([] as GemDetails[]);

  useEffect(() => {
    if (!gems.done || !currencyMap.done || (league?.indexed && !meta.done) || !xp.done) {
      return;
    }
    let cancel = false;
    let timeout: NodeJS.Timeout;

    setProgressMsg("Formatting data");

    (async () => {
      const vaalGems: { [key: string]: boolean } = {};
      let result = gems.value.lines.map(
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
          vaalGems[baseName] = vaalGems[baseName] || Vaal;
          return {
            Name: name,
            baseName,
            variant,
            Level: gemLevel,
            XP: xp.value[Type === "Awakened" ? name : baseName]?.[gemLevel],
            Quality: gemQuality || 0,
            Corrupted: corrupted || false,
            Vaal,
            Type,
            Price: Math.round(chaosValue || 0),
            Meta: (meta.done && meta.value[name]) || 0,
            Listings: listingCount,
            lowConfidence:
              !sparkline?.data?.length || sparkline.data[sparkline.data.length - 1] === null,
          } as GemDetails;
        }
      );

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

      setData(structuredClone(result));
      setProgressMsg("Calculating gcp values");
      setProgress(0);
      await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
      let timeSlice = Date.now() + 200;

      const oneGcp = currencyMap.value["Gemcutter's Prism"];

      await forEach(result, async (gem, i) => {
        if (i % 1000 === 0) {
          if (cancel) return;
          const p = (100 * i) / result.length;
          setProgress(p);
          if (Date.now() > timeSlice) {
            console.debug("yielding to ui", Date.now() - timeSlice);
            await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
            console.debug("resumed processing", Date.now() - timeSlice);
            timeSlice = Date.now() + 200;
          }
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
                other.Quality < gem.Quality
            )
            .map((other) => {
              const gcpCount = gem.Quality > other.Quality ? gem.Quality - other.Quality : 0;
              const gcpCost = gcpCount * oneGcp;
              const gcpValue = gem.Price - (other.Price + gcpCost);
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
      timeSlice = Date.now() + 200;

      await forEach(result, async (gem, i) => {
        if (i % 1000 === 0) {
          if (cancel) return;
          const p = (100 * i) / result.length;
          setProgress(p);
          if (Date.now() > timeSlice) {
            console.debug("yielding to ui", Date.now() - timeSlice);
            await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
            console.debug("resumed processing", Date.now() - timeSlice);
            timeSlice = Date.now() + 200;
          }
        }

        //XP
        if (gem.XP) {
          const qualityMultiplier =
            !altQualities.includes(gem.Type as any) && exceptional.find((e) => gem.Name.includes(e))
              ? 1 + (gem.Quality + incQual.debounced) * 0.05
              : 1;
          gem.xpData = gemMap[gem.baseName][gem.Type]
            .filter(
              (other) =>
                (lowConfidence || !other.lowConfidence) &&
                other.Corrupted === gem.Corrupted &&
                other.XP !== undefined &&
                other.XP < (gem.XP || 0)
            )
            .map((other) => {
              const gcpCount = gem.Quality > other.Quality ? gem.Quality - other.Quality : 0;
              if (gcpCount && gem.Corrupted) return undefined as any;
              const gcpCost = gcpCount * oneGcp;
              const xpValue = Math.round(
                ((gem.Price - (other.Price + gcpCost)) * qualityMultiplier) /
                  (((gem.XP || 0) - (other.XP || 0)) / million)
              );
              return { ...other, gcpCount, gcpCost, xpValue };
            })
            .filter(exists)
            .concat(
              gem.Type === "Superior" &&
                gem.Quality === 20 &&
                xp.value[gem.baseName][20] &&
                gem.gcpData
                ? gem.gcpData.map((other) => ({
                    ...other,
                    gcpCount: 1,
                    gcpCost: currencyMap.value["Gemcutter's Prism"],
                    xpValue: Math.round(
                      (gem.Price - (other.Price + oneGcp)) /
                        (((gem.XP || 0) + xp.value[gem.baseName][20] - (other.XP || 0)) / million)
                    ),
                  }))
                : []
            )
            .sort((a, b) => b.xpValue - a.xpValue);
          gem.xpValue = gem.xpData[0]?.xpValue || 0;
        }
      });

      setData(structuredClone(result));
      setProgressMsg("Calculating vaal outcomes");
      setProgress(0);
      await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
      timeSlice = Date.now() + 200;

      await forEach(result, async (gem, i) => {
        if (i % 1000 === 0) {
          if (cancel) return;
          const p = (100 * i) / result.length;
          setProgress(p);
          if (Date.now() > timeSlice) {
            console.debug("yielding to ui", Date.now() - timeSlice);
            await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
            console.debug("resumed processing", Date.now() - timeSlice);
            timeSlice = Date.now() + 200;
          }
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
            currencyMap.value["Vaal Orb"];
          let merged: VaalData | null = null;
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
      timeSlice = Date.now() + 200;

      const price = templePrice.debounced || (templeAverage.done && templeAverage.value.price);
      if (price) {
        await forEach(result, async (gem, i) => {
          if (i % 100 === 0) {
            if (cancel) return;
            const p = (100 * i) / result.length;
            setProgress(p);
            if (Date.now() > timeSlice) {
              console.debug("yielding to ui", Date.now() - timeSlice);
              await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
              console.debug("resumed processing", Date.now() - timeSlice);
              timeSlice = Date.now() + 200;
            }
          }

          // Temple corruption
          if (!gem.Corrupted) {
            let templeData: VaalData[] = [];
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
            let merged: VaalData | null = null;
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
                  (v, i) =>
                    v !== "Remove quality" && v !== "Add quality" && v !== merged?.outcomes[i]
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
              ) || 0) -
              gem.Price -
              price;
          } else {
            gem.templeValue = 0;
          }
        });
      }

      if (cancel) return;
      setProgress(100);
      setProgressMsg("");
      setData(result);
    })();

    return () => {
      cancel = true;
      clearTimeout(timeout);
      setProgress(0);
    };
  }, [
    gems,
    meta,
    xp,
    currencyMap,
    incQual.debounced,
    lowConfidence,
    templeAverage,
    templePrice.debounced,
    league?.indexed,
  ]);

  const columns: ColumnDef<GemDetails, GemDetails[keyof GemDetails]>[] = useMemo(
    () => [
      { accessorKey: "Name", filterFn: "includesString" },
      {
        accessorKey: "lowConfidence",
        header: "Low confidence",
        filterFn: "equals",
        cell: (info) => (info.getValue() ? "✓" : "✗"),
      },
      {
        accessorKey: "Corrupted",
        filterFn: "equals",
        cell: (info) => (info.getValue() ? "✓" : "✗"),
      },
      { accessorKey: "Level", filterFn: "inNumberRange" },
      { accessorKey: "Quality", filterFn: "inNumberRange" },
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
          info.getValue() === undefined
            ? "n/a"
            : numeral((info.getValue() as number).toPrecision(3)).format("0[.][00]a"),
      },
      {
        accessorKey: "xpValue",
        header: "Levelling profit",
        filterFn: "inNumberRange",
        sortingFn: (a, b) =>
          (a.original.xpData?.[0]?.xpValue || 0) - (b.original.xpData?.[0]?.xpValue || 0),
        cell: ({
          row: {
            original: { xpData },
          },
        }) =>
          !xpData?.length ? (
            "n/a"
          ) : (
            <p
              title={xpData
                ?.map(
                  ({ xpValue, Level, Quality, Price, gcpCount }, i) =>
                    `${Math.round(
                      xpValue * fiveWay.debounced
                    )}c/5-way from ${Level}/${Quality} (${Price}c${
                      gcpCount > 0 ? `+${gcpCount}gcp` : ""
                    })`
                )
                .join("\n")}>
              {Math.round(xpData[0].xpValue * fiveWay.debounced)}c/5-way
            </p>
          ),
      },
      {
        accessorKey: "gcpValue",
        header: "Profit from applying GCPs",
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
            <p
              title={gcpData
                ?.map(
                  ({ gcpValue, Level, Quality, Listings }, i) =>
                    `${numeral(gcpValue).format(
                      "0[.][00]"
                    )}c from ${Level}/${Quality} (${Listings} listed)`
                )
                .join("\n")}>
              {Math.round(gcpData[0].gcpValue)}
            </p>
          ),
      },
      {
        accessorKey: "vaalValue",
        header: "Average profit vaaling",
        filterFn: "inNumberRange",
        cell: ({
          row: {
            original: { vaalValue, vaalData },
          },
        }) =>
          vaalValue ? (
            <p
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
                    } ${gem.Name} (${gem.Listings} at ${gem.Price}c)`
                )
                .join("\n")}>
              {Math.round(vaalValue)}c
            </p>
          ) : (
            "n/a"
          ),
      },
      {
        accessorKey: "templeValue",
        header: "Average profit from temple",
        filterFn: "inNumberRange",
        cell: ({
          row: {
            original: { templeValue, templeData },
          },
        }) =>
          templeValue ? (
            <p
              title={templeData
                ?.map(
                  ({ gem, chance }) =>
                    `${numeral(chance * 100).format("0[.][00]")} %: ${gem.Level} / ${gem.Quality} ${
                      gem.Name
                    } (${gem.Listings} at ${gem.Price}c)`
                )
                .join("\n")}>
              {Math.round(templeValue)}c
            </p>
          ) : (
            "n/a"
          ),
      },
      { accessorKey: "Type", filterFn: "includes" as any },
      { accessorKey: "Price", filterFn: "inNumberRange", cell: (info) => info.getValue() + "c" },
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
    ],
    [league, fiveWay.debounced]
  );

  const table = useReactTable({
    data,
    columns,
    filterFns: { includes },
    state: {
      sorting,
      columnFilters,
      columnVisibility: { Meta: !!league?.indexed },
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
        minHeight: "100vh",
      }}>
      <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
        <Accordion expanded={!league || showOptions} onChange={(_, show) => setShowOptions(show)}>
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
                  label="override temple price"
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
                        ? `estimated Doryani's Institute price: ${templeAverage.value.price} chaos (${templeAverage.value.total} listings, used ${templeAverage.value.filtered} of first ${templeAverage.value.pageSize} results)`
                        : "no Doryani's Institute online"
                      : templeAverage.error
                      ? "error getting temple prices"
                      : "checking temple prices..."}
                  </a>
                </p>

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
                  label="gem quality bonus"
                  variant="outlined"
                  value={incQual.value}
                  onChange={({ target }) => incQual.set(target.value ? parseInt(target.value) : 0)}
                  helperText="Disfavour/Dialla/Replica Voideye: 30, Cane of Kulemak 8-15, veiled: 9-10, crafted: 7-8"
                />

                <TextField
                  type="number"
                  fullWidth
                  margin="normal"
                  label="million XP per 5-way"
                  variant="outlined"
                  value={fiveWay.value}
                  onChange={({ target }) => fiveWay.set(target.value ? parseInt(target.value) : 0)}
                />

                <Button
                  onClick={async () => {
                    ((await cache).store as LocalForage).clear();
                    refetch();
                  }}>
                  Refresh data
                </Button>
              </>
            )}
          </AccordionDetails>
        </Accordion>

        {!league ? undefined : (
          <>
            {gems.pending || currencyMap.pending || meta.pending || xp.pending ? (
              <p>Fetching data...</p>
            ) : (
              <p>{progressMsg || "\u00A0"}</p>
            )}
            <LinearProgress variant="determinate" value={progress} />
          </>
        )}
      </Container>
      {gems.error && <Alert severity="error">Error getting gem prices: {gems.error}</Alert>}
      {currencyMap.error && (
        <Alert severity="error">Error getting currency values: {currencyMap.error}</Alert>
      )}
      {meta.error && <Alert severity="error">Error getting metagame: {meta.error}</Alert>}
      {xp.error && <Alert severity="error">Error getting gem xp data: {xp.error}</Alert>}
      {gems.done && currencyMap.done && (
        <Box sx={{ minWidth: "150em" }}>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableCell key={header.id} colSpan={header.colSpan} sx={{ height: 0 }}>
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
                                  ? { cursor: "pointer", userSelect: "none", verticalAlign: "top" }
                                  : { verticalAlign: "top" },
                                onClick: header.column.getToggleSortingHandler(),
                              }}>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {{ asc: " ▲", desc: " ▼" }[header.column.getIsSorted() as string] ??
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
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Pagination
            count={table.getPageCount()}
            page={table.getState().pagination.pageIndex + 1}
            onChange={(_, page) => table.setPageIndex(page - 1)}
          />
        </Box>
      )}
      {gems.fail && String(gems.error)}
    </Box>
  );
}

export default App;
