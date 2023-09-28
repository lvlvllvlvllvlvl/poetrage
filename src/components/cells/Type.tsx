import Tooltip from "@mui/material/Tooltip";
import { GemInfo } from "apis/getGemInfo";
import info from "data/gemInfo.json";
import { qualityStat } from "functions/formatStat";
import { Gem } from "models/gems";

export const Type = ({ gem }: { gem: Gem }) => {
  return (
    <Tooltip title={qualityStat(info as GemInfo, gem)}>
      <span>{gem.Type}</span>
    </Tooltip>
  );
};
