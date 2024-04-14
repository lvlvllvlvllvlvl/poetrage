import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { cache } from "apis/axios";
import { GraphDialog } from "components/cells/Graph";
import { Settings } from "components/GemSettings";
import { GemTable } from "components/GemTable";
import { useEffect, useMemo, useReducer, useState } from "react";
import GithubCorner from "react-github-corner";
import { apiSlice } from "state/api";
import { actions, setters, tabs } from "state/app";
import { useAppDispatch, useAppSelector } from "state/store";

function App() {
  const systemMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, toggleMode] = useReducer((state) => !state, systemMode);
  const tab = useAppSelector((state) => state.app.tab);
  const showOptions = useAppSelector((state) => state.app.showOptions);
  const dispatch = useAppDispatch();
  const { setTab, setShowOptions } = setters(dispatch);
  const [appBarRef, setAppBarRef] = useState<HTMLElement | null>(null);

  const reload = useMemo(
    () => () => {
      dispatch(apiSlice.util.resetApiState());
      dispatch(actions.reload());
    },
    [dispatch],
  );
  useEffect(reload, [reload]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: {
            main: darkMode ? "#5B95DB" : "#1F334B",
          },
          secondary: {
            main: "#857D05",
          },
          error: {
            main: "#FD5649",
          },
          warning: {
            main: "#F66A00",
          },
          info: {
            main: "#357A79",
          },
          success: {
            main: "#F9A17F",
          },
        },
      }),
    [darkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}>
        <GithubCorner
          href="https://github.com/lvlvllvlvllvlvl/poetrage"
          target="_blank"
          title={import.meta.env.VITE_GIT_COMMIT}
          octoColor={theme.palette.primary.main}
          style={{ zIndex: 2000 }}
        />
        <div
          style={{
            ...theme.mixins.toolbar,
            minHeight: appBarRef?.clientHeight || theme.mixins.toolbar.minHeight,
          }}
        />
        <AppBar component="nav" ref={setAppBarRef}>
          <Toolbar>
            <IconButton color="inherit" onClick={() => setShowOptions(!showOptions)}>
              <SettingsIcon />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={async () => {
                ((await cache).store as LocalForage).clear();
                reload();
              }}>
              <RefreshIcon />
            </IconButton>
            <Typography
              variant="h6"
              component="div"
              sx={{ pl: 2, flexGrow: 1 }}
              onClick={() => setShowOptions(!showOptions)}>
              poetrage
            </Typography>
            {tabs.length > 1 && (
              <Tabs
                value={tabs.indexOf(tab)}
                onChange={(_, i) => setTab(tabs[i])}
                textColor="inherit"
                aria-label="app tabs">
                {tabs.map((tab) => (
                  <Tab key={tab} label={tab} />
                ))}
              </Tabs>
            )}
            <IconButton color="inherit" onClick={toggleMode}>
              {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
            <Box sx={{ minWidth: 64 }} />
          </Toolbar>
        </AppBar>
        {tab === "gem flipping" && (
          <>
            <Settings />
            <GraphDialog />
            <GemTable />
          </>
        )}
        {tab === "gem xp" && (
          <>
            <Settings />
            <GraphDialog />
            <GemTable />
          </>
        )}
        {tab === "lab" && (
          <>
            <Settings />
            <GraphDialog />
            <GemTable />
          </>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
