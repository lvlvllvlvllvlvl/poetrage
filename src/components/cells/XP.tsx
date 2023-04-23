import { GemDetails } from "models/gems";
import numeral from "numeral";
import { useAppSelector } from "state/store";

export const XP = ({ gem: { xpData } }: { gem: GemDetails }) => {
  const fiveWay = useAppSelector(({ app }) => app.fiveWay.debounced);
  return !xpData?.length ? (
    <>n/a</>
  ) : (
    <span
      title={xpData
        ?.map(
          ({ xpValue, Level, Quality, Price, gcpCount, reset }, i) =>
            `${Math.round(xpValue * fiveWay)}c/5-way${
              reset ? "" : gcpCount === 0 ? "" : ` applying ${gcpCount} gcp and`
            } levelling this gem to ${Level}/${Quality} (${Price}c)${
              reset ? " with vendor reset" : ""
            }`
        )
        .join("\n")}>
      {Math.round(xpData[0].xpValue * fiveWay)}c/5-way (
      {numeral(xpData[0].xpDiff / fiveWay).format("0[.][00]")} 5-ways)
    </span>
  );
};
