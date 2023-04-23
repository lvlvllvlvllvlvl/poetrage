import { getCurrency } from "functions/getCurrency";
import { GemDetails } from "models/gems";
import numeral from "numeral";
import { currencyMap } from "state/api";
import { regradeValue } from "state/selectors/costs";
import { useAppSelector } from "state/store";

export const Regrade = ({
  gem: original,
  gem: { Name, Price, regrValue, regrData },
}: {
  gem: GemDetails;
}) => {
  const currency = useAppSelector(currencyMap);
  const getRegradeValue = useAppSelector(regradeValue);
  const primeRegrading = useAppSelector(({ app }) => app.primeRegrading.debounced);
  const secRegrading = useAppSelector(({ app }) => app.secRegrading.debounced);
  return !regrData?.length ? (
    <>n/a</>
  ) : (
    <span
      title={regrData
        ?.map(
          ({ gem, chance }) =>
            `${numeral(chance * 100).format("0[.][00]")}% ${Math.round(
              gem.Price -
                Price -
                (Name.includes("Support")
                  ? secRegrading || getCurrency("Secondary Regrading Lens", currency.value, 0)
                  : primeRegrading || getCurrency("Prime Regrading Lens", currency.value, 0))
            )}c: ${gem.Level}/${gem.Quality} ${gem.Name} (${
              gem.Price ? `${gem.Listings} at ${gem.Price}c` : "low confidence"
            } - ${gem.Meta}% meta)`
        )
        .join("\n")}>
      {Math.round(getRegradeValue(original))}c
    </span>
  );
};
