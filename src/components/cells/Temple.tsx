import Typography from "@mui/material/Typography";
import { GemIcons } from "components/GemIcons";
import PopupState, { bindHover, bindPopover } from "material-ui-popup-state";
import HoverPopover from "material-ui-popup-state/HoverPopover";
import { GemDetails, getId } from "models/gems";
import numeral from "numeral";
import { templeCost } from "state/selectors/costs";
import { useAppSelector } from "state/store";
import { Pinned } from "./Pinned";
import { Price } from "./Price";

export const Temple = ({
  gem: original,
  gem: { templeValue, templeData },
}: {
  gem: GemDetails;
}) => {
  const costOfTemple = useAppSelector(templeCost);
  return templeValue ? (
    <PopupState variant="popover" popupId={getId(original) + "-temple"}>
      {(popupState) => (
        <div>
          <Typography {...bindHover(popupState)}>
            {Math.round(templeValue - costOfTemple)}c
          </Typography>
          <HoverPopover {...bindPopover(popupState)} sx={{ pointerEvents: "none" }}>
            {templeData?.map(({ gem, chance, outcomes: [outcome] }, i) => (
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
