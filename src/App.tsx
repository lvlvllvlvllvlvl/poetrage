import RefreshIcon from "@mui/icons-material/Refresh";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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
import Snackbar from "@mui/material/Snackbar";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { cache } from "apis/axios";
import {
  getAwakenedLevelAverage,
  getAwakenedRerollAverage,
  getTempleAverage,
} from "apis/getAveragePrice";
import { getCurrencyOverview } from "apis/getCurrencyOverview";
import { getGemOverview } from "apis/getGemOverview";
import { getGemQuality as getGemInfo } from "apis/getGemQuality";
import { getLeagues } from "apis/getLeagues";
import { getMeta } from "apis/getMeta";
import "App.css";
import Filter from "components/Filter";
import { calculateProfits } from "functions/calculateProfits";
import { getColumns } from "functions/getColumns";
import { useAsync } from "functions/useAsync";
import useDebouncedState from "functions/useDebouncedState";
import { GemDetails, isEqual, Override } from "models/Gems";
import { League } from "models/ninja/Leagues";
import React, { useEffect, useMemo, useReducer, useState } from "react";
import GithubCorner from "react-github-corner";
import SearchOperators from "search-operators";

const includes: FilterFn<GemDetails> = (row, columnId, filterValue: any[]) =>
  (filterValue?.length || 0) === 0 || filterValue.includes(row.getValue(columnId));

const search: FilterFn<GemDetails> = (
  row,
  columnId,
  { filters, terms }: SearchOperators.ParseResult
) => {
  const value = row.getValue(columnId) as string;
  for (const term of terms) {
    const lower = (term as string).toLowerCase();
    if (!value.toLowerCase().includes(lower)) {
      return false;
    }
  }
  for (const filter of filters) {
    const lower = filter.value.toLowerCase();
    if (filter.type === "exact") {
      return value.toLowerCase() === lower;
    } else if (filter.type === "exclude") {
      return !value.toLowerCase().includes(lower);
    }
  }
  return true;
};

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

  const getRegrValue = useMemo(
    () =>
      ({ regrValue, Name }: GemDetails) =>
        (regrValue || 0) -
        (Name.includes("Support")
          ? secRegrading.debounced || currencyMap.value?.("Secondary Regrading Lens") || 0
          : primeRegrading.debounced || currencyMap.value?.("Prime Regrading Lens") || 0),
    [currencyMap, primeRegrading.debounced, secRegrading.debounced]
  );

  const [overridesTmp, setOverride] = useReducer<
    (state: Override[], action: Override | Override[]) => Override[]
  >((state, update) => {
    if (Array.isArray(update)) {
      return update;
    }
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
  }, []);
  const [overrides, applyOverrides] = useState(overridesTmp);
  const overridesPending = overrides !== overridesTmp;

  useEffect(
    () =>
      calculateProfits(
        gems,
        currencyMap,
        league?.indexed,
        meta,
        gemInfo,
        filterMeta.debounced,
        overrides,
        sanitize,
        setData,
        setProgress,
        setProgressMsg,
        lowConfidence,
        incQual.debounced,
        mavenExclusiveWeight.debounced,
        mavenCrucibleWeight.debounced
      ),
    [
      gems,
      currencyMap,
      league?.indexed,
      meta,
      gemInfo,
      filterMeta.debounced,
      overrides,
      sanitize,
      setData,
      setProgress,
      setProgressMsg,
      lowConfidence,
      incQual.debounced,
      mavenExclusiveWeight.debounced,
      mavenCrucibleWeight.debounced,
    ]
  );

  const columns = useMemo(
    () =>
      getColumns(
        league,
        overridesTmp,
        setOverride,
        fiveWay.debounced,
        currencyMap,
        costOfTemple,
        costOfAwakenedLevel,
        costOfAwakenedReroll,
        getRegrValue,
        secRegrading.debounced,
        primeRegrading.debounced
      ),
    [
      league,
      overridesTmp,
      setOverride,
      fiveWay.debounced,
      currencyMap,
      costOfTemple,
      costOfAwakenedLevel,
      costOfAwakenedReroll,
      getRegrValue,
      secRegrading.debounced,
      primeRegrading.debounced,
    ]
  );

  const table = useReactTable({
    data,
    columns,
    filterFns: { search, includes },
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
      <Snackbar
        open={!!overridesTmp.length || !!overrides.length}
        message={overridesPending ? "Custom prices have not been applied" : "Custom prices applied"}
        action={
          <>
            {overridesPending && (
              <Button size="small" onClick={() => applyOverrides(overridesTmp)}>
                apply
              </Button>
            )}
            {overridesPending && (
              <Button color="secondary" size="small" onClick={() => setOverride(overrides)}>
                undo
              </Button>
            )}
            {!!overrides.length && (
              <Button
                color="error"
                size="small"
                onClick={() => {
                  const empty = [] as Override[];
                  setOverride(empty);
                  applyOverrides(empty);
                }}>
                reset
              </Button>
            )}
          </>
        }
      />
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
