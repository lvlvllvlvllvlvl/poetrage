import Tooltip from "@mui/material/Tooltip";
import { qualityStat } from "functions/formatStat";
import { Gem } from "models/gems";
import { useSelector } from "react-redux";
import info from "data/gemInfo.json";
import { GemInfo } from "apis/getGemInfo";

export const Type = ({ gem }: { gem: Gem }) => {
  return (
    <Tooltip title={qualityStat(info as GemInfo, gem)}>
      <span>{gem.Type}</span>
    </Tooltip>
  );
};
