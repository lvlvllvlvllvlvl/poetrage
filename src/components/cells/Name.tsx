import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import { GemIcons } from "components/GemIcons";
import { Gem, getId, getQueryUrl } from "models/gems";
import { useAppSelector } from "state/store";

export const Name = ({ gem }: { gem: Gem }) => {
  const league = useAppSelector((state) => state.app.league);
  return (
    <>
      <Tooltip title={getId(gem)}>
        <Link target="_blank" rel="noreferrer" href={getQueryUrl(gem, league?.name)}>
          {gem.Name}
        </Link>
      </Tooltip>
      <GemIcons gem={gem} />
    </>
  );
};
