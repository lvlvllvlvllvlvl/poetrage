import CopyIcon from "@mui/icons-material/CopyAll";
import PushPinIcon from "@mui/icons-material/PushPin";
import IconButton from "@mui/material/IconButton";
import ToggleButton from "@mui/material/ToggleButton";
import Tooltip from "@mui/material/Tooltip";
import { GemDetails, getGemFromData, getId } from "models/gems";
import { useDispatch } from "react-redux";
import { setters } from "state/app";
import { useAppSelector } from "state/store";

export const Pinned = ({ gem, copy }: { gem: GemDetails; copy?: any }) => {
  const pins = useAppSelector((state) => state.app.pins);
  const data = useAppSelector((state) => state.app.data);
  const devMode = useAppSelector((state) => state.app.devMode);
  const { setPins } = setters(useDispatch());
  const id = getId(gem);

  return (
    <>
      <ToggleButton
        value="pinned"
        selected={gem.Pinned}
        sx={{ width: 18, height: 18 }}
        onClick={() => setPins(gem.Pinned ? pins.filter((pin) => pin !== id) : pins.concat(id))}>
        <PushPinIcon />
      </ToggleButton>
      {devMode && (
        <Tooltip title={JSON.stringify(gem.original)}>
          <IconButton
            sx={{ width: 18, height: 18 }}
            onClick={() =>
              navigator.clipboard.writeText(JSON.stringify(copy ?? getGemFromData(id, data)))
            }>
            <CopyIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};
