import Tooltip from "@mui/material/Tooltip";
import { qualityStat } from "functions/formatStat";
import { Gem } from "models/gems";
import { useSelector } from "react-redux";
import { gemInfo } from "state/api";

export const Type = ({ gem }: { gem: Gem }) => {
  const info = useSelector(gemInfo);
  return (
    <Tooltip title={info.status === "done" ? qualityStat(info.value, gem) : undefined}>
      <span>{gem.Type}</span>
    </Tooltip>
  );
};
