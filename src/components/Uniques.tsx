import CopyIcon from "@mui/icons-material/CopyAll";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import numeral from "numeral";
import { useAppSelector } from "state/store";

export function Uniques() {
  const weights = useAppSelector((state) => state.app.uniqueData);
  const devMode = useAppSelector((state) => state.app.devMode);
  const progressMsg = useAppSelector((state) => state.app.uniqueProgressMsg);

  if (!weights) {
    return "Processing";
  }

  return (
    <>
      <Typography variant="h3" align="center">
        Vaal Orb profits
      </Typography>
      <Paper sx={{ width: "100vw", height: "100%", overflow: "auto" }}>
        {Object.entries(weights).map(([k, v]) => (
          <Accordion key={k}>
            <AccordionSummary sx={{ userSelect: "text" }}>
              {k}: {numeral(v.profit).format("0[.][0]")}c
            </AccordionSummary>
            <AccordionDetails>
              {devMode && (
                <Tooltip title={JSON.stringify(v)}>
                  <IconButton
                    sx={{ width: 18, height: 18 }}
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(v))}>
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              )}
              {Object.entries(v.outcomes)
                .sort(([, l], [, r]) => r.ev - l.ev)
                .map(([stat, { profit, chance }]) => (
                  <Typography key={stat}>
                    {numeral(chance * 100).format("0[.][0]")}%: {stat} (
                    {numeral(Math.abs(profit)).format("0[.][0]")}c {profit < 0 ? "loss" : "profit"})
                  </Typography>
                ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
      <Box sx={{ display: "flex" }}>
        <Box sx={{ pl: 2, flexGrow: 1 }}>
          <Typography component="p" p={1}>
            {progressMsg || "All currency costs accounted for in profit values"}
          </Typography>
        </Box>
        <Typography p={1}>
          This product isn't affiliated with or endorsed by Grinding Gear Games in any way.
        </Typography>
      </Box>
    </>
  );
}
