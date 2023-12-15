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
        ?.map(({ xpValue, xpDiff, Level, Quality, Price, gcpCount, reset }, i) =>
          fiveWay
            ? `${Math.round(xpValue * fiveWay)}c/5-way${
                reset ? "" : gcpCount === 0 ? "" : ` applying ${gcpCount} gcp and`
              } levelling this gem to ${Level}/${Quality} (${Price}c)${
                reset ? " with vendor reset" : ""
              } (${numeral(xpDiff / fiveWay).format("0[.][00]")} 5-ways)`
            : `${Math.round(xpValue * 100)}c/100m XP${
                reset ? "" : gcpCount === 0 ? "" : ` applying ${gcpCount} gcp and`
              } levelling this gem to ${Level}/${Quality} (${Price}c)${
                reset ? " with vendor reset" : ""
              } (${numeral(xpDiff * 1000000).format("0[.][00]a")} XP)`,
        )
        .join("\n")}>
      {Math.round(xpData[0].xpValue * (fiveWay || 100))}c
    </span>
  );
};
