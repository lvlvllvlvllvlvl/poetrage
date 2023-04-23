import { GemDetails } from "models/gems";
import { awakenedRerollCost } from "state/selectors/costs";
import { useAppSelector } from "state/store";

export const AwakenedReroll = ({ gem: { convertValue } }: { gem: GemDetails }) => {
  const costOfAwakenedReroll = useAppSelector(awakenedRerollCost);
  return <>{convertValue ? Math.round(convertValue - costOfAwakenedReroll) + "c" : "n/a"}</>;
};
