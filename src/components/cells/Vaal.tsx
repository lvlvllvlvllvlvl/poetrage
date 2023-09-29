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

export const Vaal = ({ gem: original, gem: { vaalValue, vaalData } }: { gem: GemDetails }) => {
  const league = useAppSelector(({ app }) => app.league);
  return vaalValue ? (
    <PopupState variant="popover" popupId={getId(original) + "-vaal"}>
      {(popupState) => (
        <div>
          <Typography {...bindHover(popupState)}>{Math.round(vaalValue)}c</Typography>
          <HoverPopover {...bindPopover(popupState)} sx={{ pointerEvents: "none" }}>
            {vaalData?.map(({ gem, chance, outcomes: [outcome] }, i) => (
              <Typography key={i} sx={{ m: 1 }}>
                {numeral(chance * 100).format("0[.][00]")}% {outcome}:{" "}
                <Link target="_blank" rel="noreferrer" href={getQueryUrl(gem, league?.name)}>
                  {gem.Level}/{gem.Quality}
                  {gem.Vaal ? " Vaal" : ""}
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
