import { GemDetails } from "models/gems";
import numeral from "numeral";

export const GCP = ({ gem: { gcpData } }: { gem: GemDetails }) =>
  !gcpData?.length ? (
    <>n/a</>
  ) : (
    <span
      title={gcpData
        ?.map(
          ({ gcpValue, Level, Quality, Listings, Price }, i) =>
            `Earn ${numeral(gcpValue).format(
              "0[.][00]",
            )}c upgrading this gem to ${Level}/${Quality} (${Listings} listed at ${Price}c)`,
        )
        .join("\n")}>
      {Math.round(gcpData[0].gcpValue)}c
    </span>
  );
