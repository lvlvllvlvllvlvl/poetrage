import { GemDetails } from "models/gems";
import { useAppSelector } from "state/store";

export const Meta = ({ gem: { Meta, Name: Gem } }: { gem: GemDetails }) => {
  const league = useAppSelector((state) => state.app.league);
  return Meta ? (
    <a
      href={`https://poe.ninja/${league?.url}/builds?allskill=${Gem.replaceAll(" ", "-")}`}
      target="_blank"
      rel="noreferrer">
      {Meta} %
    </a>
  ) : (
    <>n/a</>
  );
};
