import numeral from "numeral";
import { useAppSelector } from "state/store";

export function Uniques() {
  const weights = useAppSelector((state) => state.app.uniqueData);

  if (!weights) {
    return "Processing";
  }

  return (
    <>
      {Object.entries(weights).map(([k, v]) => (
        <details key={k}>
          <summary>
            {k} - {numeral(v.profit).format("0[.][0]")}c
          </summary>
          {Object.entries(v.outcomes)
            .sort(([, l], [, r]) => r.ev - l.ev)
            .map(([stat, { profit, chance }]) => (
              <p>
                {numeral(chance * 100).format("0[.][0]")}%: {stat} (
                {numeral(profit).format("0[.][0]")}c)
              </p>
            ))}
        </details>
      ))}
    </>
  );
}
