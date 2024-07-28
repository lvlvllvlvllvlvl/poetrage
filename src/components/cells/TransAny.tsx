import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { GemIcons } from "components/GemIcons";
import PopupState, { bindHover, bindPopover } from "material-ui-popup-state";
import HoverPopover from "material-ui-popup-state/HoverPopover";
import { GemDetails, getId, getQueryUrl } from "models/gems";
import numeral from "numeral";
import { useAppSelector } from "state/store";
import { Pinned } from "./Pinned";
import { Price } from "./Price";

export const TransAny = ({
  gem: original,
  gem: { transAnyValue: transValue, transAnyData: transData },
}: {
  gem: GemDetails;
}) => {
  const league = useAppSelector(({ app }) => app.league);
  return transValue ? (
    <PopupState variant="popover" popupId={getId(original) + "-trans"}>
      {(popupState) => (
        <div>
          <Typography {...bindHover(popupState)}>{Math.round(transValue)}c</Typography>
          <HoverPopover {...bindPopover(popupState)} sx={{ pointerEvents: "none" }}>
            {transData?.map(({ gem, chance, outcomes: [outcome] }, i) => (
              <Typography key={i} sx={{ m: 1 }}>
                {numeral(chance * 100).format("0[.][00]")}%:{" "}
                <Link target="_blank" rel="noreferrer" href={getQueryUrl(gem, league?.name)}>
                  {gem.Level}/{gem.Quality} {gem.Name}
                </Link>
                <GemIcons gem={gem} /> <Pinned gem={gem} /> ({gem.Listings} listed -{" "}
                <Price inline gem={gem} />)
              </Typography>
            ))}
          </HoverPopover>
        </div>
      )}
    </PopupState>
  ) : (
    <>n/a</>
  );
};
