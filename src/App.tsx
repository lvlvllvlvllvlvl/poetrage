import Box from "@mui/material/Box";
import "App.css";
import { GemTable } from "components/GemTable";
import { GraphDialog } from "components/GraphDialog";
import { Settings } from "components/Settings";
import GithubCorner from "react-github-corner";

function App() {
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
      <Settings />
      <GraphDialog />
      <GemTable />
    </Box>
  );
}

export default App;
