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
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { cache } from "apis/axios";
import { getCurrency } from "functions/getCurrency";
import { Override } from "models/gems";
import { useEffect } from "react";
import * as api from "state/api";
import { actions, setters } from "state/app";
import { useAppDispatch, useAppSelector } from "state/store";

export const Settings = () => {
  const dispatch = useAppDispatch();
  const {
    setLeague,
    setLadder,
    setShowOptions,
    setSanitize,
    setTemplePrice,
    setLowConfidence,
    setPrimeRegrading,
    setSecRegrading,
    setFilterMeta,
    setIncQual,
    setFiveWay,
    setOverrides,
    setPreview,
  } = setters(dispatch);

  const gemInfo = useAppSelector(api.gemInfo);
  const leagues = useAppSelector(api.leagues);
  const meta = useAppSelector(api.meta);
  const gems = useAppSelector(api.gems);
  const currencyMap = useAppSelector(api.currencyMap);
  const templeAverage = useAppSelector(api.templeAverage);
  const league = useAppSelector((state) => state.app.league);
  const leaderboard = useAppSelector((state) => state.app.ladder);
  const showOptions = useAppSelector((state) => state.app.showOptions);
  const sanitize = useAppSelector((state) => state.app.sanitize);
  const templePrice = useAppSelector((state) => state.app.templePrice);
  const lowConfidence = useAppSelector((state) => state.app.lowConfidence);
  const primeRegrading = useAppSelector((state) => state.app.primeRegrading);
  const secRegrading = useAppSelector((state) => state.app.secRegrading);
  const filterMeta = useAppSelector((state) => state.app.filterMeta);
  const incQual = useAppSelector((state) => state.app.incQual);
  const fiveWay = useAppSelector((state) => state.app.fiveWay);
  const progress = useAppSelector((state) => state.app.progress);
  const progressMsg = useAppSelector((state) => state.app.progressMsg);
  const graphProgress = useAppSelector((state) => state.app.graphProgress);
  const graphProgressMsg = useAppSelector((state) => state.app.graphProgressMsg);
  const overridesTmp = useAppSelector((state) => state.app.overridesTmp);
  const overrides = useAppSelector((state) => state.app.overrides);
  const preview = useAppSelector((state) => state.app.preview);
  const overridesPending = overrides !== overridesTmp;

  useEffect(() => {
    dispatch(actions.reload);
  }, [dispatch]);
  const reload = () => dispatch(actions.reload());
  return (
    <>
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
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Ladder</InputLabel>
                    <Select
                      value={leaderboard}
                      label="leaderboard"
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
                      <Checkbox checked={preview} onChange={(_, checked) => setPreview(checked)} />
                    }
                    label="preview upcoming features"
                  />
                </>
              )}
            </AccordionDetails>
          </Accordion>
          <IconButton
            sx={{ width: 48, height: 48, margin: 1 }}
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
            <LinearProgress title={graphProgressMsg} variant="determinate" value={graphProgress} />
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
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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
    </>
  );
};
