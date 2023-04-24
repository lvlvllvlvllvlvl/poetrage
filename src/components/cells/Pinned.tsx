import PushPinIcon from "@mui/icons-material/PushPin";
import CopyIcon from "@mui/icons-material/CopyAll";
import IconButton from "@mui/material/IconButton";
import ToggleButton from "@mui/material/ToggleButton";
import { GemDetails, getId } from "models/gems";
import { useDispatch } from "react-redux";
import { setters } from "state/app";
import { useAppSelector } from "state/store";
import Tooltip from "@mui/material/Tooltip";

export const Pinned = ({ gem }: { gem: GemDetails }) => {
  const pins = useAppSelector((state) => state.app.pins);
  const devMode = useAppSelector((state) => state.app.devMode);
  const { setPins } = setters(useDispatch());

  return (
    <>
      <ToggleButton
        value="pinned"
        selected={gem.Pinned}
        sx={{ width: 18, height: 18 }}
        onClick={() =>
          setPins(gem.Pinned ? pins.filter((pin) => pin !== getId(gem)) : pins.concat(getId(gem)))
        }>
        <PushPinIcon />
      </ToggleButton>
      {devMode && (
        <Tooltip title={JSON.stringify(gem.original)}>
          <IconButton
            sx={{ width: 18, height: 18 }}
            onClick={() => navigator.clipboard.writeText(JSON.stringify(gem))}>
            <CopyIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};
