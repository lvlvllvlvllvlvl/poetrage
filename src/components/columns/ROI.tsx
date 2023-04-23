import { GemDetails, getRatios } from "models/gems";
import numeral from "numeral";
import { currencyMap } from "state/api";
import { awakenedLevelCost, awakenedRerollCost, templeCost } from "state/selectors/costs";
import { useAppSelector } from "state/store";

export const ROI = ({ gem }: { gem: GemDetails }) => {
  const currency = useAppSelector(currencyMap);
  const costOfTemple = useAppSelector(templeCost);
  const costOfAwakenedLevel = useAppSelector(awakenedLevelCost);
  const costOfAwakenedReroll = useAppSelector(awakenedRerollCost);
  const ratios = getRatios(
    gem,
    currency.value,
    costOfTemple,
    costOfAwakenedLevel,
    costOfAwakenedReroll
  );
  return ratios?.length ? (
    <span
      title={ratios
        .map(
          ({ name, ratio, profit, cost }) =>
            `${name}: ${numeral(ratio).format("0[.][00]")} (cost: ${numeral(cost).format(
              "0[.][00]"
            )}c, profit: ${numeral(profit).format("0[.][00]")}c)`
        )
        .join("\n")}>
      {numeral(ratios[0].ratio).format("0[.][00]")}
    </span>
  ) : (
    <>n/a</>
  );
};
