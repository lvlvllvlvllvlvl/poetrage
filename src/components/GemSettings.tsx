import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Drawer from "@mui/material/Drawer";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import { Override } from "models/gems";
import * as api from "state/api";
import { actions, AppState, setters } from "state/app";
import { graphInputs } from "state/selectors/graphInputs";
import { profitInputs } from "state/selectors/profitInputs";
import { RootState, useAppDispatch, useAppSelector } from "state/store";

const copy =
  (field: keyof AppState | "profitInputs" | "graphInputs") =>
  (dispatch: any, getState: () => RootState) => {
    const data =
      field === "profitInputs"
        ? profitInputs(getState())
        : field === "graphInputs"
        ? { ...graphInputs(getState()), data: [] }
        : getState().app[field];
    navigator.clipboard.writeText(JSON.stringify(data));
  };

export const Settings = () => {
  const dispatch = useAppDispatch();
  const {
    setShowOptions,
    setLeague,
    setLadder,
    setSource,
    setSanitize,
    setTemplePrice,
    setLowConfidence,
    setFilterMeta,
    setIncQual,
    setFiveWay,
    setOverrides,
    setDevMode,
  } = setters(dispatch);

  const showOptions = useAppSelector((state) => state.app.showOptions);
  const leagues = useAppSelector(api.leagues);
  const meta = useAppSelector(api.meta);
  const gems = useAppSelector(api.gems);
  const currencyMap = useAppSelector(api.currencyMap);
  const templeAverage = useAppSelector(api.templeAverage);
  const league = useAppSelector((state) => state.app.league);
  const source = useAppSelector((state) => state.app.source);
  const leaderboard = useAppSelector((state) => state.app.ladder);
  const sanitize = useAppSelector((state) => state.app.sanitize);
  const templePrice = useAppSelector((state) => state.app.templePrice);
  const lowConfidence = useAppSelector((state) => state.app.lowConfidence);
  const filterMeta = useAppSelector((state) => state.app.filterMeta);
  const incQual = useAppSelector((state) => state.app.incQual);
  const fiveWay = useAppSelector((state) => state.app.fiveWay);
  const overridesTmp = useAppSelector((state) => state.app.overridesTmp);
  const overrides = useAppSelector((state) => state.app.overrides);
  const devMode = useAppSelector((state) => state.app.devMode);
  const overridesPending = overrides !== overridesTmp;

  return (
    <>
      <Drawer anchor="left" open={showOptions} onClose={() => setShowOptions(false)}>
        <Box component="form" sx={{ p: 4, maxWidth: 512 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Data source</InputLabel>
            <Select
              value={source}
              label="Data source"
              onChange={({ target }) => setSource(target.value as any)}>
              <MenuItem value="ninja">poe.ninja</MenuItem>
              <MenuItem value="watch">poe.watch</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>League</InputLabel>
            <Select
              value={leagues.status === "done" && league ? league?.name : ""}
              label="League"
              onChange={({ target }) =>
                setLeague(leagues.value?.economyLeagues?.find(({ name }) => name === target.value))
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
              <FormControl fullWidth margin="normal">
                <InputLabel>Ladder</InputLabel>
                <Select
                  value={leaderboard}
                  label="Ladder"
                  onChange={({ target }) => setLadder(target.value as any)}>
                  <MenuItem value="exp">Experience</MenuItem>
                  <MenuItem value="depthsolo">Depth</MenuItem>
                </Select>
              </FormControl>

              <TextField
                type="number"
                fullWidth
                margin="normal"
                label="Override temple price"
                variant="outlined"
                value={templePrice.value || ""}
                onChange={({ target }) => setTemplePrice(target.value ? parseInt(target.value) : 0)}
              />
              <p>
                {templeAverage.status === "done" ? (
                  <Link
                    href={`https://www.pathofexile.com/trade/search/${league.name}/${templeAverage.value.searchId}`}
                    target="_blank"
                    rel="noreferrer">
                    {templeAverage.value.total
                      ? `Estimated Doryani's Institute price: ${templeAverage.value.price} chaos (${templeAverage.value.total} listings, used ${templeAverage.value.filtered} of first ${templeAverage.value.pageSize} results)`
                      : "No Doryani's Institute online"}
                  </Link>
                ) : templeAverage.status === "fail" ? (
                  "Error getting temple prices"
                ) : (
                  "Checking temple prices..."
                )}
              </p>

              <FormControl fullWidth margin="normal">
                <InputLabel>Include low confidence values</InputLabel>
                <Select
                  value={lowConfidence}
                  label="Include low confidence values"
                  onChange={({ target }) =>
                    setLowConfidence(target.value as "all" | "none" | "corrupted")
                  }>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="corrupted">Corruption outcomes &gt; 20/20 only</MenuItem>
                </Select>
              </FormControl>

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
                helperText="This can vary substantially depending on the hidden mods of slain rares. Note that gem xp is earned at a different rate than character xp"
              />

              <FormControlLabel
                control={
                  <Checkbox checked={devMode} onChange={(_, checked) => setDevMode(checked)} />
                }
                label="dev mode"
              />
              {devMode && (
                <Box>
                  <Button onClick={() => dispatch(copy("profitInputs"))}>Copy profit inputs</Button>
                  <Button onClick={() => dispatch(copy("graphInputs"))}>Copy graph inputs</Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Drawer>

      {gems.error && <Alert severity="error">Error getting gem prices: {gems.error}</Alert>}
      {currencyMap.error && (
        <Alert severity="error">Error getting currency values: {currencyMap.error}</Alert>
      )}
      {meta.error && <Alert severity="error">Error getting metagame: {meta.error}</Alert>}
      <Snackbar
        open={!!overridesTmp.length || !!overrides.length}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        style={{ bottom: 96 }}
        message={overridesPending ? "Custom prices have not been applied" : "Custom prices applied"}
        action={
          <>
            {overridesPending && (
              <Button size="small" color="secondary" onClick={() => setOverrides(overridesTmp)}>
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
                color="secondary"
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
    </>
  );
};
