import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { GemIcons } from "components/GemIcons";
import PopupState, { bindHover, bindPopover } from "material-ui-popup-state";
import HoverPopover from "material-ui-popup-state/HoverPopover";
import { GemDetails, getId, getQueryUrl } from "models/gems";
import { awakenedLevelCost } from "state/selectors/costs";
import { useAppSelector } from "state/store";
import { Pinned } from "./Pinned";
import { Price } from "./Price";

export const AwakenedLevel = ({ gem: original, gem: { levelData } }: { gem: GemDetails }) => {
  const costOfAwakenedLevel = useAppSelector(awakenedLevelCost);
  const league = useAppSelector(({ app }) => app.league);
  return !levelData?.length ? (
    <>n/a</>
  ) : (
    <PopupState variant="popover" popupId={getId(original) + "-brambleback"}>
      {(popupState) => (
        <div>
          <Typography {...bindHover(popupState)}>
            {Math.round(levelData[0].levelValue - costOfAwakenedLevel)}c/level
          </Typography>
          <HoverPopover {...bindPopover(popupState)} sx={{ pointerEvents: "none" }}>
            {levelData?.map((gem, i) => (
              <Typography key={i} sx={{ m: 1 }}>
                {Math.round(gem.levelValue - costOfAwakenedLevel)}c profit/level applying
                {gem.gcpCount === 0 ? "" : ` ${gem.gcpCount} gcp and`} {gem.levelDiff}{" "}
                Wild Brambleback to{" "}
                <Link target="_blank" rel="noreferrer" href={getQueryUrl(gem, league?.name)}>
                  {gem.Level}/{gem.Quality}
                </Link>{" "}
                <GemIcons gem={gem} />
                <Pinned gem={gem} /> <Price inline gem={gem} />
              </Typography>
            ))}
          </HoverPopover>
        </div>
      )}
    </PopupState>
  );
};
