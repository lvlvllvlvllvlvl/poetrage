import Tooltip from "@mui/material/Tooltip";
import { GemIcons } from "components/GemIcons";
import { Gem, getId, getQuery } from "models/gems";
import { useAppSelector } from "state/store";

export const Name = ({ gem }: { gem: Gem }) => {
  const league = useAppSelector((state) => state.app.league);
  return (
    <>
      <Tooltip title={getId(gem)}>
        <a
          target="_blank"
          rel="noreferrer"
          href={`https://www.pathofexile.com/trade/search/${league?.name}?q=${JSON.stringify(
            getQuery(gem)
          )}`}>
          {gem.Name}
        </a>
      </Tooltip>
      <GemIcons gem={gem} />
    </>
  );
};
