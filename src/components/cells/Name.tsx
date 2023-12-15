import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { GemIcons } from "components/GemIcons";
import { Gem, getQueryUrl } from "models/gems";
import { useAppSelector } from "state/store";

export const Name = ({ gem }: { gem: Gem }) => {
  const league = useAppSelector((state) => state.app.league);
  return (
    <Box sx={{ textAlign: "left" }}>
      <Link target="_blank" rel="noreferrer" href={getQueryUrl(gem, league?.name)}>
        {gem.Level}/{gem.Quality}
        {gem.Corrupted ? "c" : ""} {gem.Name}
      </Link>
      <GemIcons gem={gem} />
    </Box>
  );
};
