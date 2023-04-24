import Typography from "@mui/material/Typography";
import { GemIcons } from "components/GemIcons";
import PopupState, { bindHover, bindPopover } from "material-ui-popup-state";
import HoverPopover from "material-ui-popup-state/HoverPopover";
import { GemDetails, getId } from "models/gems";
import numeral from "numeral";
import { Price } from "./Price";
import { Pinned } from "./Pinned";

export const Vaal = ({ gem: original, gem: { vaalValue, vaalData } }: { gem: GemDetails }) => {
  return vaalValue ? (
    <PopupState variant="popover" popupId={getId(original) + "-vaal"}>
      {(popupState) => (
        <div>
          <Typography {...bindHover(popupState)}>{Math.round(vaalValue)}c</Typography>
          <HoverPopover {...bindPopover(popupState)} sx={{ pointerEvents: "none" }}>
            {vaalData?.map(({ gem, chance, outcomes: [outcome] }, i) => (
              <Typography key={i} sx={{ m: 1 }}>
                {numeral(chance * 100).format("0[.][00]")}% {outcome}: {gem.Level}/{gem.Quality}
                {gem.Vaal ? " Vaal" : ""}
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
