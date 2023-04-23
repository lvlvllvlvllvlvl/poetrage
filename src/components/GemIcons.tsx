import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import { Gem } from "models/gems";
import { useAppSelector } from "state/store";

export const GemIcons = ({ gem }: { gem: Gem }) => {
  const filterMeta = useAppSelector((state) => state.app.filterMeta.debounced);
  return (
    <>
      {gem.isOverride && (
        <Tooltip title="custom price has been set for this gem">
          <InfoIcon fontSize="inherit" color="info" />
        </Tooltip>
      )}
      {gem.Meta < filterMeta && (
        <Tooltip
          title={`this gem is used by only ${gem.Meta} percent of players, and may be hard to sell`}>
          <InfoIcon fontSize="inherit" color="warning" />
        </Tooltip>
      )}
      {gem.lowConfidence && (
        <Tooltip title="price data for this gem may be incorrect">
          <InfoIcon fontSize="inherit" color="error" />
        </Tooltip>
      )}
    </>
  );
};
