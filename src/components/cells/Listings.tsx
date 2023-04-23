import { GemDetails } from "models/gems";
import { useAppSelector } from "state/store";

export const Listings = ({ gem: { Listings, Name: Gem } }: { gem: GemDetails }) => {
  const league = useAppSelector((state) => state.app.league);
  return (
    <a
      href={`https://poe.ninja/${league?.url}/skill-gems?name=${Gem}`}
      target="_blank"
      rel="noreferrer">
      {Listings}
    </a>
  );
};
