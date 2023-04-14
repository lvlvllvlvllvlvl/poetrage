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
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import "App.css";
import { cache } from "apis/axios";
import { getCurrency } from "apis/getCurrencyOverview";
import Filter from "components/Filter";
import { isFunction } from "lodash";
import { GemDetails, Override } from "models/Gems";
import { useEffect } from "react";
import GithubCorner from "react-github-corner";
import * as api from "redux/api";
import { actions, setters } from "redux/app";
import "redux/listeners/calculateProfits";
import { getColumns } from "redux/selectors/getColumns";
import { useAppDispatch, useAppSelector } from "redux/store";
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
  const dispatch = useAppDispatch();
  const {
    setLeague,
    setSorting,
    setShowOptions,
    setColumnFilters,
    setSanitize,
    setTemplePrice,
    setLowConfidence,
    setPrimeRegrading,
    setSecRegrading,
    setFilterMeta,
    setIncQual,
    setFiveWay,
    setOverrides,
  } = setters(dispatch);

  const gemInfo = useAppSelector(api.gemInfo);
  const leagues = useAppSelector(api.leagues);
  const meta = useAppSelector(api.meta);
  const gems = useAppSelector(api.gems);
  const currencyMap = useAppSelector(api.currencyMap);
  const templeAverage = useAppSelector(api.templeAverage);
  const {
    league,
    sorting,
    showOptions,
    columnFilters,
    sanitize,
    templePrice,
    lowConfidence,
    primeRegrading,
    secRegrading,
    filterMeta,
    incQual,
    fiveWay,
    progress,
    progressMsg,
    data,
    overridesTmp,
    overrides,
  } = useAppSelector((state) => {
    const {
      league,
      sorting,
      showOptions,
      columnFilters,
      sanitize,
      templePrice,
      lowConfidence,
      primeRegrading,
      secRegrading,
      filterMeta,
      incQual,
      fiveWay,
      progress,
      progressMsg,
      data,
      overridesTmp,
      overrides,
    } = state.app;
    return {
      league,
      sorting,
      showOptions,
      columnFilters,
      sanitize,
      templePrice,
      lowConfidence,
      primeRegrading,
      secRegrading,
      filterMeta,
      incQual,
      fiveWay,
      progress,
      progressMsg,
      data,
      gemInfo,
      leagues,
      meta,
      gems,
      currencyMap,
      templeAverage,
      overridesTmp,
      overrides,
    };
  });

  useEffect(() => {
    dispatch(actions.reload);
  }, [dispatch]);
  const reload = () => dispatch(actions.reload());

  const overridesPending = overrides !== overridesTmp;

  const columns = useAppSelector(getColumns);
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
    onColumnFiltersChange: (updater) =>
      setColumnFilters(isFunction(updater) ? updater(columnFilters) : updater),
    onSortingChange: (updater) => setSorting(isFunction(updater) ? updater(sorting) : updater),
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
      <GithubCorner
        href="https://github.com/lvlvllvlvllvlvl/poetrage"
        target="_blank"
        title={process.env.REACT_APP_GIT_COMMIT}
      />
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
                  value={leagues.status === "done" && league ? league?.name : ""}
                  label="league"
                  onChange={({ target }) =>
                    setLeague(
                      leagues.value?.economyLeagues?.find(({ name }) => name === target.value)
                    )
                  }>
                  {leagues.status === "pending" && !league && (
                    <MenuItem value="" disabled>
                      Loading leagues...
                    </MenuItem>
                  )}
                  {leagues.status !== "pending" && !league && (
                    <MenuItem value="" disabled>
                      Select a league
                    </MenuItem>
                  )}
                  {leagues.status === "done" &&
                    leagues.value.economyLeagues.map((league) => (
                      <MenuItem key={league.name} value={league.name}>
                        {league.displayName}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              {leagues.status === "fail" && String(leagues.error)}

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
                      setTemplePrice(target.value ? parseInt(target.value) : 0)
                    }
                  />
                  <p>
                    {templeAverage.status === "done" ? (
                      <a
                        href={`https://www.pathofexile.com/trade/search/${league.name}/${templeAverage.value.searchId}`}
                        target="_blank"
                        rel="noreferrer">
                        {templeAverage.value.total
                          ? `Estimated Doryani's Institute price: ${templeAverage.value.price} chaos (${templeAverage.value.total} listings, used ${templeAverage.value.filtered} of first ${templeAverage.value.pageSize} results)`
                          : "No Doryani's Institute online"}
                      </a>
                    ) : templeAverage.status === "fail" ? (
                      "Error getting temple prices"
                    ) : (
                      "Checking temple prices..."
                    )}
                  </p>

                  <TextField
                    type="number"
                    fullWidth
                    margin="normal"
                    label="Prime regrading lens price"
                    placeholder={Math.round(
                      getCurrency("Prime Regrading Lens", currencyMap.value, 0)
                    ).toString()}
                    variant="outlined"
                    value={primeRegrading.value || ""}
                    onChange={({ target }) =>
                      setPrimeRegrading(target.value ? parseInt(target.value) : 0)
                    }
                  />

                  <TextField
                    type="number"
                    fullWidth
                    margin="normal"
                    label="Secondary regrading lens price"
                    placeholder={Math.round(
                      getCurrency("Secondary Regrading Lens", currencyMap.value, 0)
                    ).toString()}
                    variant="outlined"
                    value={secRegrading.value || ""}
                    onChange={({ target }) =>
                      setSecRegrading(target.value ? parseInt(target.value) : 0)
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
                      setFilterMeta(target.value ? parseFloat(target.value) : 0)
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
                    onChange={({ target }) => setIncQual(target.value ? parseInt(target.value) : 0)}
                    helperText="Disfavour/Dialla/Replica Voideye: 30, Cane of Kulemak 8-15, veiled: 9-10, crafted: 7-8"
                  />

                  <TextField
                    type="number"
                    fullWidth
                    margin="normal"
                    label="Million XP per 5-way"
                    variant="outlined"
                    value={fiveWay.value}
                    onChange={({ target }) => setFiveWay(target.value ? parseInt(target.value) : 0)}
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
              {gems.status === "pending" ||
              currencyMap.status === "pending" ||
              meta.status === "pending" ||
              gemInfo.status === "pending"
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
              <Button size="small" onClick={() => setOverrides(overridesTmp)}>
                apply
              </Button>
            )}
            {overridesPending && (
              <Button
                color="secondary"
                size="small"
                onClick={() => dispatch(actions.setOverride(overrides))}>
                undo
              </Button>
            )}
            {!!overrides.length && (
              <Button
                color="error"
                size="small"
                onClick={() => {
                  const empty = [] as Override[];
                  dispatch(actions.setOverride(empty));
                  setOverrides(empty);
                }}>
                reset
              </Button>
            )}
          </>
        }
      />
      {gems.status === "done" && currencyMap.status === "done" && (
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
      {gems.status === "fail" && String(gems.error)}
    </Box>
  );
}

export default App;
