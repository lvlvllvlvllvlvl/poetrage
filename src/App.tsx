import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  FormControl,
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
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import numeral from "numeral";
import { PathOfExile, PoENinja } from "poe-api-ts";
import React, { useEffect, useMemo, useState } from "react";
import { getBuilds } from "./apis/getBuilds";
import { getExp } from "./apis/getExp";
import { getLeagues } from "./apis/getLeagues";
import "./App.css";
import { filterOutliers } from "./filterOutliers";
import { forEach } from "./helpers/forEach";
import { useAsync } from "./helpers/useAsync";
import useDebouncedState from "./helpers/useDebouncedState";
import {
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

const query: any = {
  query: {
    status: {
      option: "onlineleague",
    },
    stats: [
      {
        type: "and",
        filters: [
          {
            id: "pseudo.pseudo_temple_gem_room_3",
            value: { option: 1 },
            disabled: false,
          },
        ],
      },
    ],
  },
  sort: { price: "asc" },
};

const billion = 1000000000;
const poe = /https:\/\/(www.)?pathofexile.com/;
const ninja = "https://poe.ninja";

axios.interceptors.request.use((config) => {
  if (config.data && Object.keys(config.data).length === 0) delete config.data;
  if (config.headers) delete config.headers["Content-Type"];
  config.url = config?.url
    ?.replace(ninja, "http://localhost:8080/ninja")
    ?.replace(poe, "http://localhost:8080/poe");
  return config;
});
function App() {
  const [showOptions, setShowOptions] = useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [league, setLeague] = useState("");
  const [templePriceDisplay, templePrice, setTemplePrice] = useDebouncedState(0);
  const [incQualDisplay, incQual, setIncQual] = useDebouncedState(30);
  const [minMetaDisplay, minMeta, setMinMeta] = useDebouncedState(1);
  const [minListingsDisplay, minListings, setMinListings] = useDebouncedState(10);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const leagues = useAsync(getLeagues);
  const gems = useAsync(league ? PoENinja.Items.SkillGems.getOverview : undefined, league);
  const xp = useAsync(getExp);
  const currency = useAsync(
    league ? PoENinja.Currencies.getOverview : undefined,
    league,
    "Currency" as any
  );
  const temples = useAsync(league ? PathOfExile.PublicAPI.Trade.search : undefined, league, query);
  const builds = useAsync(league ? getBuilds : undefined, league);
  // temples.value is changed by this call; can't include it in the dependencies
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchPage = useMemo(
    () => (temples.done ? temples.value.getNextItems.bind(temples.value) : undefined),
    [temples.done]
  );
  const templePage = useAsync(fetchPage, 10);
  const leagueUrl = useMemo(
    () => leagues.done && leagues.value.economyLeagues.find(({ name }) => name === league)?.url,
    [league, leagues]
  );
  const [data, setData] = useState([] as GemDetails[]);

  const gemMeta: { [key: string]: number } = useMemo(() => {
    if (!builds.done) {
      return {};
    }
    const result: { [key: string]: number } = {};
    const total = builds.value.accounts.length / 1000;
    builds.value.allSkills.forEach(({ name }, i) => {
      result[name] = Math.round(builds.value.allSkillUse[i.toString()].length / total) / 10;
    });
    return result;
  }, [builds]);

  const currencyMap: { [key: string]: number } = useMemo(() => {
    if (!currency.done) return { chaos: 1 };
    const result: { [key: string]: number } = { chaos: 1 };
    currency.value.entries.forEach((c) => (result[c.name] = c.chaosEquivalent));
    return result;
  }, [currency]);

  const averageTemple = useMemo(() => {
    if (!templePage.done || !currency.done) {
      return;
    }
    const prices = templePage.value?.map(({ listing: { price } }) => price) || [];
    const chaosValues = prices
      .filter(({ currency, amount }) => currency && amount && currencyMap[currency])
      .map(({ currency, amount }: any) => currencyMap[currency] * amount);
    let filteredValues = filterOutliers(chaosValues);
    const sum = filteredValues.reduce((a, b) => a + b, 0);
    return Math.round(sum / filteredValues.length);
  }, [currency.done, currencyMap, templePage]);

  useEffect(() => {
    if (!gems.done || !currency.done || !builds.done || !xp.done) {
      return;
    }
    let cancel = false;
    let timeout: NodeJS.Timeout;

    setProgressMsg("Formatting data");

    (async () => {
      const vaalGems: { [key: string]: boolean } = {};
      let result = gems.value.entries.map(
        ({ name, chaosValue, gemLevel, gemQuality, corrupted, listingCount }) => {
          const baseName = modifiers.reduce((name, mod) => name.replace(mod, ""), name);
          const Vaal = name.includes("Vaal");
          vaalGems[baseName] = vaalGems[baseName] || Vaal;
          return {
            Name: name,
            baseName,
            Level: gemLevel,
            XP: xp.value[baseName]?.[gemLevel] || -1,
            Quality: gemQuality || 0,
            Corrupted: corrupted || false,
            Vaal,
            Type: getType(name),
            Price: Math.round(chaosValue || 0),
            Meta: gemMeta[name] || 0,
            Listings: listingCount,
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

      await forEach(result, async (gem, i) => {
        if (i % 1000 === 0) {
          if (cancel) return;
          const p = (100 * i) / result.length;
          setProgress(p);
          if (Date.now() > timeSlice) {
            console.debug("yielding to ui thread", Date.now() - timeSlice);
            await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
            console.debug("resumed processing", Date.now() - timeSlice);
            timeSlice = Date.now() + 200;
          }
        }

        //GCP
        if (!gem.Corrupted && gem.Quality) {
          gem.gcpData = result
            .filter(
              (other) =>
                other.Name === gem.Name &&
                !other.Corrupted &&
                other.Level === gem.Level &&
                other.Quality < gem.Quality &&
                other.Price < gem.Price
            )
            .map((other) => {
              const gcpCount = gem.Quality > other.Quality ? gem.Quality - other.Quality : 0;
              if (gcpCount && gem.Corrupted) return undefined as any;
              const gcpCost = gcpCount * (currencyMap["Gemcutter's Prism"] || 1);
              const gcpValue = gem.Price - (other.Price + gcpCost);
              return gcpValue > 0 ? { ...other, gcpCount, gcpCost, gcpValue } : (undefined as any);
            })
            .filter(exists)
            .sort((a, b) => b.gcpValue - a.gcpValue);
        }
      });

      setData(structuredClone(result));
      setProgressMsg("Calculating xp values");
      setProgress(0);
      await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
      timeSlice = Date.now() + 200;

      const oneGcp = currencyMap["Gemcutter's Prism"] || 1;

      await forEach(result, async (gem, i) => {
        if (i % 1000 === 0) {
          if (cancel) return;
          const p = (100 * i) / result.length;
          setProgress(p);
          if (Date.now() > timeSlice) {
            console.debug("yielding to ui thread", Date.now() - timeSlice);
            await new Promise((resolve) => (timeout = setTimeout(resolve, 1)));
            console.debug("resumed processing", Date.now() - timeSlice);
            timeSlice = Date.now() + 200;
          }
        }

        //XP
        if (gem.XP && gem.XP > 0) {
          const qualityMultiplier =
            gem.Type === "Superior" && exceptional.find((e) => gem.Name.includes(e))
              ? 1 + (gem.Quality + incQual) * 0.05
              : 1;
          gem.xpData = result
            .filter(
              (other) =>
                other.Name === gem.Name &&
                other.Corrupted === gem.Corrupted &&
                gem.XP &&
                other.XP !== undefined &&
                other.XP !== -1 &&
                other.XP < gem.XP
            )
            .map((other) => {
              const gcpCount = gem.Quality > other.Quality ? gem.Quality - other.Quality : 0;
              if (gcpCount && gem.Corrupted) return undefined as any;
              const gcpCost = gcpCount * oneGcp;
              if (other.Price + gcpCost > gem.Price) return undefined as any;
              const xpValue = Math.round(
                ((gem.Price - (other.Price + gcpCost)) * qualityMultiplier) /
                  (((gem.XP || 0) - (other.XP || 0)) / billion)
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
                    gcpCost: currencyMap["Gemcutter's Prism"] || 1,
                    xpValue: Math.round(
                      (gem.Price - (other.Price + oneGcp)) /
                        ((gem.XP + xp.value[gem.baseName][20] - other.XP) / billion)
                    ),
                  }))
                : []
            )
            .sort((a, b) => b.xpValue - a.xpValue);
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
            console.debug("yielding to ui thread", Date.now() - timeSlice);
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
              minListings
            ),
          }));
          gem.vaalValue =
            (vaalData?.reduce((sum, { gem, chance }) => sum + (gem?.Price || 0) * chance, 0) || 0) -
            gem.Price -
            (currencyMap["Vaal Orb"] || 1);
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

      if (templePrice || averageTemple) {
        await forEach(result, async (gem, i) => {
          if (i % 100 === 0) {
            if (cancel) return;
            const p = (100 * i) / result.length;
            setProgress(p);
            if (Date.now() > timeSlice) {
              console.debug("yielding to ui thread", Date.now() - timeSlice);
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
                  minListings
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
              (templePrice || averageTemple || 100);
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
    gemMeta,
    xp,
    currency.done,
    builds.done,
    currencyMap,
    incQual,
    minListings,
    averageTemple,
    templePrice,
  ]);

  const columns: ColumnDef<GemDetails, GemDetails[keyof GemDetails]>[] = useMemo(
    () => [
      { accessorKey: "Name" },
      {
        accessorKey: "Corrupted",
        cell: (info) => (info.getValue() ? "✓" : "✗"),
      },
      { accessorKey: "Level" },
      { accessorKey: "Quality" },
      {
        accessorKey: "XP",
        cell: (info) =>
          info.getValue() === undefined
            ? "Loading..."
            : info.getValue() === -1
            ? "n/a"
            : numeral((info.getValue() as number).toPrecision(3)).format("0[.][00]a"),
      },
      {
        accessorKey: "xpData",
        header: "XP value",
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
                    `${xpValue}c/billion from ${Level}/${Quality} (${Price}c${
                      gcpCount > 0 ? `+${gcpCount}gcp` : ""
                    })`
                )
                .join("\n")}>
              {xpData[0].xpValue}c/billion
            </p>
          ),
      },
      {
        accessorKey: "gcpData",
        header: "GCP value",
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
        header: "Vaal value",
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
        header: "Temple corrupt value",
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
      { accessorKey: "Type" },
      { accessorKey: "Price", cell: (info) => info.getValue() + "c" },
      {
        accessorKey: "Meta",
        cell: ({
          row: {
            original: { Meta, Name: Gem },
          },
        }) =>
          Meta ? (
            <a
              href={`https://poe.ninja/${leagueUrl}/builds?allskill=${Gem.replaceAll(" ", "-")}`}
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
        cell: ({
          row: {
            original: { Listings, Name: Gem },
          },
        }) => (
          <a
            href={`https://poe.ninja/${leagueUrl}/skill-gems?name=${Gem}`}
            target="_blank"
            rel="noreferrer">
            {Listings}
          </a>
        ),
      },
    ],
    [leagueUrl]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  if (table.getState().pagination.pageSize !== 100) {
    table.setPageSize(100);
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}>
      <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
        <Typography component="h1" variant="h5" gutterBottom>
          poetrage
        </Typography>

        <Accordion expanded={!league || showOptions} onChange={(_, show) => setShowOptions(show)}>
          <AccordionSummary style={{ display: league ? undefined : "none" }}>
            <Typography>...</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth margin="normal">
              <InputLabel>League</InputLabel>
              <Select
                value={league}
                label="League"
                onChange={({ target }) => setLeague(target.value)}>
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
                  leagues.value.economyLeagues.map(({ name }) => (
                    <MenuItem key={name} value={name}>
                      {name}
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
                  value={templePriceDisplay || ""}
                  onChange={({ target }) =>
                    setTemplePrice(target.value ? parseInt(target.value) : 0)
                  }
                />
                <p>
                  <a
                    href={
                      temples.done
                        ? `https://www.pathofexile.com/trade/search/${league}/${temples.value.id}`
                        : undefined
                    }
                    target="_blank"
                    rel="noreferrer">
                    {temples.done && templePage.done
                      ? templePage.value?.length
                        ? `Estimated Doryani's Institute price: ${averageTemple} chaos`
                        : "No Doryani's Institute online"
                      : temples.error && templePage.error
                      ? "Error getting temple prices"
                      : "Checking temple prices..."}
                  </a>
                </p>

                <TextField
                  type="number"
                  fullWidth
                  margin="normal"
                  label="Gem quality bonus"
                  variant="outlined"
                  value={incQualDisplay}
                  onChange={({ target }) => setIncQual(target.value ? parseInt(target.value) : 0)}
                  helperText="Dialla's/Replica Voideye: 30, Cane of Kulemak 8-15, veiled: 9-10, crafted: 7-8"
                />

                <TextField
                  type="number"
                  fullWidth
                  margin="normal"
                  label="Meta %"
                  variant="outlined"
                  value={minMetaDisplay}
                  onChange={({ target }) => setMinMeta(target.value ? parseInt(target.value) : 0)}
                />
                <TextField
                  type="number"
                  fullWidth
                  margin="normal"
                  label="Listing count"
                  variant="outlined"
                  value={minListingsDisplay}
                  onChange={({ target }) =>
                    setMinListings(target.value ? parseInt(target.value) : 0)
                  }
                />
              </>
            )}
          </AccordionDetails>
        </Accordion>

        {!league ? undefined : (
          <>
            {gems.pending || currency.pending || builds.pending || xp.pending ? (
              <p>Fetching data...</p>
            ) : (
              <p>{progressMsg || "\u00A0"}</p>
            )}
            <LinearProgress variant="determinate" value={progress} />
          </>
        )}
      </Container>
      {gems.done && currency.done && builds.done && (
        <>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableCell key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : (
                          <div
                            {...{
                              style: header.column.getCanSort()
                                ? { cursor: "pointer", userSelect: "none" }
                                : {},
                              onClick: header.column.getToggleSortingHandler(),
                            }}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{ asc: " ▲", desc: " ▼" }[header.column.getIsSorted() as string] ??
                              null}
                          </div>
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
        </>
      )}
      {gems.fail && String(gems.error)}
    </Box>
  );
}

export default App;
