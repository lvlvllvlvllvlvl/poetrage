import Typography from "@mui/material/Typography";
import PopupState, { bindHover, bindPopover } from "material-ui-popup-state";
import HoverPopover from "material-ui-popup-state/HoverPopover";
import { GemDetails, getId, getRatios } from "models/gems";
import numeral from "numeral";
import { currencyMap } from "state/api";
import { awakenedLevelCost, awakenedRerollCost, templeCost } from "state/selectors/costs";
import { useAppSelector } from "state/store";

export const ROI = ({ gem }: { gem: GemDetails }) => {
  const currency = useAppSelector(currencyMap);
  const costOfTemple = useAppSelector(templeCost);
  const costOfAwakenedLevel = useAppSelector(awakenedLevelCost);
  const costOfAwakenedReroll = useAppSelector(awakenedRerollCost);
  const ratios = getRatios(
    gem,
    currency.value,
    costOfTemple,
    costOfAwakenedLevel,
    costOfAwakenedReroll
  );
  return ratios?.length ? (
    <PopupState variant="popover" popupId={getId(gem) + "-roi"}>
      {(popupState) => (
        <div>
          <Typography {...bindHover(popupState)}>
            {numeral(ratios[0].ratio).format("0[.][00]")}
          </Typography>
          <HoverPopover {...bindPopover(popupState)} sx={{ pointerEvents: "none" }}>
            {ratios.map(({ name, ratio, profit, cost }, i) => (
              <Typography key={i} sx={{ m: 1 }}>
                {name}: {numeral(ratio).format("0[.][00]")} (cost:{" "}
                {numeral(cost).format("0[.][00]")}c, profit: {numeral(profit).format("0[.][00]")}c)
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
