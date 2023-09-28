import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { GemIcons } from "components/GemIcons";
import { getCurrency } from "functions/getCurrency";
import PopupState, { bindHover, bindPopover } from "material-ui-popup-state";
import HoverPopover from "material-ui-popup-state/HoverPopover";
import { GemDetails, getId, getQueryUrl } from "models/gems";
import numeral from "numeral";
import { currencyMap } from "state/api";
import { regradeValue } from "state/selectors/costs";
import { useAppSelector } from "state/store";
import { Pinned } from "./Pinned";
import { Price } from "./Price";
import { Type } from "./Type";

export const Regrade = ({ gem: original, gem: { Name, regrData } }: { gem: GemDetails }) => {
  const currency = useAppSelector(currencyMap);
  const getRegradeValue = useAppSelector(regradeValue);
  const primeRegrading = useAppSelector(({ app }) => app.primeRegrading.debounced);
  const secRegrading = useAppSelector(({ app }) => app.secRegrading.debounced);
  const league = useAppSelector(({ app }) => app.league);
  return !regrData?.length ? (
    <>n/a</>
  ) : (
    <PopupState variant="popover" popupId={getId(original) + "-regrade"}>
      {(popupState) => (
        <div>
          <Typography {...bindHover(popupState)}>
            {Math.round(getRegradeValue(original))}c
          </Typography>
          <HoverPopover {...bindPopover(popupState)} sx={{ pointerEvents: "none" }}>
            {regrData?.map(({ gem, chance }, i) => (
              <Typography key={i} sx={{ m: 1 }}>
                {numeral(chance * 100).format("0[.][00]")}%{" "}
                {Math.round(
                  gem.Price -
                    original.Price -
                    (Name.includes("Support")
                      ? secRegrading || getCurrency("Secondary Regrading Lens", currency.value, 0)
                      : primeRegrading || getCurrency("Prime Regrading Lens", currency.value, 0)),
                )}
                c:{" "}
                <Link target="_blank" rel="noreferrer" href={getQueryUrl(gem, league?.name)}>
                  {gem.Level}/{gem.Quality}
                </Link>{" "}
                <Type gem={gem} /> {gem.baseName}
                <GemIcons gem={gem} /> <Pinned gem={gem} /> ({gem.Meta + "% meta - "}
                <Price inline gem={gem} />)
              </Typography>
            ))}
          </HoverPopover>
        </div>
      )}
    </PopupState>
  );
};
