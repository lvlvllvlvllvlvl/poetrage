import { GemDetails } from "models/gems";
import { awakenedLevelCost } from "state/selectors/costs";
import { useAppSelector } from "state/store";

export const AwakenedLevel = ({ gem: { levelData } }: { gem: GemDetails }) => {
  const costOfAwakenedLevel = useAppSelector(awakenedLevelCost);
  return !levelData?.length ? (
    <>n/a</>
  ) : (
    <span
      title={levelData
        ?.map(
          ({ levelValue, levelDiff, Level, Quality, Price, gcpCount }, i) =>
            `${Math.round(levelValue - costOfAwakenedLevel)}c profit/level applying${
              gcpCount === 0 ? "" : ` ${gcpCount} gcp and`
            } ${levelDiff} Wild Brambleback to ${Level}/${Quality} (${Price}c)`
        )
        .join("\n")}>
      {Math.round(levelData[0].levelValue)}c/level
    </span>
  );
};
