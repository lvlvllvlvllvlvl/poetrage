import { GemInfo } from "apis/getGemInfo";
import { Gem } from "models/gems";
import numeral from "numeral";

const quantifiers: { [key: string]: (n: number) => string } = {
  none: (n) => numeral(n).format("0[.][00]"),
  divide_by_one_hundred: (n) => numeral(n / 100).format("0[.][00]"),
  milliseconds_to_seconds_1dp: (n) => numeral(n / 1000).format("0.0"),
  per_minute_to_per_second: (n) => numeral(n / 60).format("0[.][00]"),
  divide_by_one_hundred_2dp: (n) => numeral(n / 100).format("0.00"),
  negate: (n) => numeral(-n).format("0[.][00]"),
  divide_by_one_hundred_and_negate: (n) => numeral(-n / 100).format("0[.][00]"),
  multiply_by_four: (n) => numeral(n * 4).format("0[.][00]"),
  per_minute_to_per_second_2dp_if_required: (n) => numeral(n / 60).format("0[.][00]"),
  milliseconds_to_seconds: (n) => numeral(n / 1000).format("0[.][00]"),
  milliseconds_to_seconds_2dp_if_required: (n) => numeral(n / 60).format("0[.][00]"),
  milliseconds_to_seconds_2dp: (n) => numeral(n / 1000).format("0.00"),
};

const getQuantifier = (quantifier: string) => {
  const q = quantifiers[quantifier || "none"];
  if (!q) {
    console.log("Unknown quantifier", quantifier);
    return (n: number) => `=${quantifier}(${numeral(n).format("0[.][00]")})`;
  }
  return q;
};

export type SimpleValue = [number];
export type RangeValue = [number, number];
export type Value = SimpleValue | RangeValue;

export const formatStat = (stat: string, values: Value[]) =>
  stat.replaceAll(
    /\{(\d+)\/?(\w*)\}/g,
    (match, index, quantifier) =>
      (values[parseInt(index)] || values[0])?.map(getQuantifier(quantifier)).join(" to ") || "?"
  );

export const qualityStat = (gemInfo: GemInfo, gem: Gem) =>
  gemInfo.qualityStats[gem.baseName][gem.Type === "Awakened" ? "Superior" : gem.Type]
    ?.map(({ id, stat, value }) => {
      const v: Value = gem.Quality ? [(value * gem.Quality) / 1000] : [value / 1000, value / 50];
      const values: Value[] =
        gem.baseName === "Frostblink" && gem.Type === "Divergent" ? [[0], v] : [v];
      return stat ? formatStat(stat, values) : id;
    })
    .join("\n") || "";
