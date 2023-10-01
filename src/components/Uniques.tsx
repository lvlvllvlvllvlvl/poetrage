import CopyIcon from "@mui/icons-material/CopyAll";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Link,
  Paper,
  TablePagination,
  Tooltip,
  Typography,
} from "@mui/material";
import { getCurrency } from "functions/getCurrency";
import numeral from "numeral";
import { useState } from "react";
import { currencyMap } from "state/api";
import { useAppSelector } from "state/store";

export function Uniques() {
  const weights = useAppSelector((state) => state.app.uniqueData);
  const devMode = useAppSelector((state) => state.app.devMode);
  const progressMsg = useAppSelector((state) => state.app.uniqueProgressMsg);
  const league = useAppSelector((state) => state.app.league?.name);
  const currency = useAppSelector(currencyMap);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const vaal = getCurrency("Vaal Orb", currency.value);

  if (!weights) {
    return "Processing";
  }

  return (
    <>
      <Typography variant="h3" align="center">
        Vaal Orb profits
      </Typography>
      <Paper sx={{ width: "100vw", height: "100%", overflow: "auto" }}>
        {Object.entries(weights)
          .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
          .map(([k, v]) => (
            <Accordion key={k}>
              <AccordionSummary sx={{ userSelect: "text" }}>
                {k}: {numeral(v.profit - vaal).format("0[.][0]")}c
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
                  .map(([stat, { profit, chance, listings, query }]) => {
                    const text = (
                      <Typography key={stat}>
                        {numeral(chance * 100).format("0[.][0]")}%: {stat} (
                        {numeral(Math.abs(profit)).format("0[.][0]")}c{" "}
                        {profit < 0 ? "loss" : "profit"}
                        {listings ? `, ${listings} listed` : ""})
                      </Typography>
                    );
                    if (query) {
                      const url = `https://www.pathofexile.com/trade/search/${league}?q=${JSON.stringify(
                        { query, sort: { price: "asc" } },
                      )}`;
                      return (
                        <Link key={stat} target="_blank" rel="noreferrer" href={url}>
                          {text}
                        </Link>
                      );
                    } else {
                      return text;
                    }
                  })}
              </AccordionDetails>
            </Accordion>
          ))}
      </Paper>
      <Box sx={{ display: "flex" }}>
        <TablePagination
          component="div"
          count={Object.keys(weights).length}
          page={page}
          onPageChange={(_, page) => setPage(page)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value));
            setPage(0);
          }}
        />
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
