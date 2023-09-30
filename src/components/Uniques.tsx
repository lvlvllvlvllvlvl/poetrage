import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import numeral from "numeral";
import { useAppSelector } from "state/store";

export function Uniques() {
  const weights = useAppSelector((state) => state.app.uniqueData);

  if (!weights) {
    return "Processing";
  }

  return (
    <>
      <Typography variant="h3" align="center">
        Vaal Orb profits
      </Typography>
      {Object.entries(weights).map(([k, v]) => (
        <Accordion key={k}>
          <AccordionSummary sx={{ userSelect: "text" }}>
            {k}: {numeral(v.profit).format("0[.][0]")}c
          </AccordionSummary>
          <AccordionDetails>
            {Object.entries(v.outcomes)
              .sort(([, l], [, r]) => r.ev - l.ev)
              .map(([stat, { profit, chance }]) => (
                <Typography>
                  {numeral(chance * 100).format("0[.][0]")}%: {stat} (
                  {numeral(profit).format("0[.][0]")}c profit)
                </Typography>
              ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}
