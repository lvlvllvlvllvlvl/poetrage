import { GemDetails } from "models/gems";
import numeral from "numeral";
import { templeCost } from "state/selectors/costs";
import { useAppSelector } from "state/store";

export const Temple = ({ gem: { templeValue, templeData } }: { gem: GemDetails }) => {
  const costOfTemple = useAppSelector(templeCost);
  return templeValue ? (
    <span
      title={templeData
        ?.map(
          ({ gem, chance }) =>
            `${numeral(chance * 100).format("0[.][00]")} %: ${gem.Level} / ${gem.Quality} ${
              gem.Name
            }${gem.Price ? ` (${gem.Listings} at ${gem.Price}c)` : ""}${
              gem.lowConfidence ? " (low confidence)" : ""
            }`
        )
        .join("\n")}>
      {Math.round(templeValue - costOfTemple)}c
    </span>
  ) : (
    <>n/a</>
  );
};
