import { GemDetails } from "models/gems";
import numeral from "numeral";
import { useAppSelector } from "state/store";

export const Meta = ({ gem: { Meta, Name: Gem } }: { gem: GemDetails }) => {
  const league = useAppSelector((state) => state.app.league);
  return Meta ? (
    <a
      href={`https://poe.ninja/${league?.url}/builds?allskill=${Gem.replaceAll(" ", "-")}`}
      target="_blank"
      rel="noreferrer">
      {numeral(Meta).format("0[.][00]a")} %
    </a>
  ) : (
    <>n/a</>
  );
};
