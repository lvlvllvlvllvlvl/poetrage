import { GemDetails } from "models/gems";
import numeral from "numeral";

export const Vaal = ({ gem: { vaalValue, vaalData } }: { gem: GemDetails }) =>
  vaalValue ? (
    <span
      title={vaalData
        ?.map(
          ({ gem, chance, outcomes: [outcome] }) =>
            `${numeral(chance * 100).format("0[.][00]")}% ${outcome}: ${gem.Level}/${gem.Quality}${
              gem.Listings === 0 && (outcome === "Add quality" || outcome === "Remove quality")
                ? "+"
                : ""
            } ${gem.Name}${gem.Price ? ` (${gem.Listings} at ${gem.Price}c)` : ""}${
              gem.lowConfidence ? " (low confidence)" : ""
            }`
        )
        .join("\n")}>
      {Math.round(vaalValue)}c
    </span>
  ) : (
    <>n/a</>
  );
