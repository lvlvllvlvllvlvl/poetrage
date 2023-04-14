import { createSelector } from "@reduxjs/toolkit";
import { ColumnDef, SortingFn } from "@tanstack/react-table";
import "App.css";
import { GemInfo } from "apis/getGemQuality";
import { EditOverride } from "components/Override";
import { GemDetails, Override, getQuery, getRatios, isEqual } from "models/Gems";
import { League } from "models/ninja/Leagues";
import numeral from "numeral";
import { ApiResult, currencyMap, gemInfo } from "redux/api";
import { RootState as AppState } from "redux/store";
import { awakenedLevelCost, awakenedRerollCost, regradeValue, templeCost } from "./costs";
import { getCurrency } from "apis/getCurrencyOverview";

export const getColumns = createSelector(
  [
    ({ app }: AppState) => app.league,
    ({ app }: AppState) => app.overrides,
    gemInfo,
    ({ app }: AppState) => app.fiveWay.debounced,
    currencyMap,
    templeCost,
    awakenedLevelCost,
    awakenedRerollCost,
    regradeValue,
    ({ app }: AppState) => app.secRegrading.debounced,
    ({ app }: AppState) => app.primeRegrading.debounced,
  ],
  output
);

function output(
  league: League | undefined,
  overrides: Override[],
  gemInfo: ApiResult<GemInfo>,
  fiveWay: number,
  currencyMap: ApiResult<{ [key: string]: number }>,
  costOfTemple: number,
  costOfAwakenedLevel: number,
  costOfAwakenedReroll: number,
  getRegrValue: ({ regrValue, Name }: GemDetails) => number,
  secRegrading: number,
  primeRegrading: number
): ColumnDef<GemDetails, GemDetails[keyof GemDetails]>[] {
  return [
    {
      accessorKey: "Name",
      filterFn: "search" as any,
      cell: (info) => (
        <a
          target="_blank"
          rel="noreferrer"
          href={`https://www.pathofexile.com/trade/search/${league?.name}?q=${JSON.stringify(
            getQuery(info.row.original)
          )}`}>
          {info.getValue() as string}
        </a>
      ),
    },
    {
      accessorKey: "Corrupted",
      filterFn: "equals",
      cell: (info) => (info.getValue() ? "✓" : "✗"),
    },
    { accessorKey: "Level", filterFn: "inNumberRange" },
    { accessorKey: "Quality", filterFn: "inNumberRange" },
    { accessorKey: "Type", filterFn: "includes" as any },
    {
      accessorKey: "Price",
      filterFn: "inNumberRange",
      cell: ({ row: { original } }) => (
        <EditOverride
          original={original}
          override={overrides.find((o) => o.original && isEqual(original, o.original))}
          gemInfo={gemInfo.value}
          league={league?.name}
          currencyMap={currencyMap.value}
        />
      ),
    },
    {
      accessorKey: "XP",
      sortingFn: (({ original: { XP: a } }, { original: { XP: b } }) =>
        a === b ? 0 : a === undefined ? -1 : b === undefined ? 1 : a - b) as SortingFn<GemDetails>,
      filterFn: "inNumberRange",
      cell: (info) =>
        Number.isInteger(info.getValue())
          ? numeral((info.getValue() as number).toPrecision(3)).format("0[.][00]a")
          : "n/a",
    },
    {
      id: "xpValue",
      accessorFn: ({ xpValue }) => xpValue * fiveWay,
      header: "Levelling",
      sortingFn: (({ original: { xpValue: a } }, { original: { xpValue: b } }) =>
        a === b ? 0 : a === undefined ? -1 : b === undefined ? 1 : a - b) as SortingFn<GemDetails>,
      filterFn: "inNumberRange",
      cell: ({
        row: {
          original: { xpData },
        },
      }) =>
        !xpData?.length ? (
          "n/a"
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
        ),
    },
    {
      id: "xpRatio",
      accessorFn: ({ xpValue, Price }) => (xpValue ? (xpValue * fiveWay) / Price : 0),
      header: "Levelling ratio",
      sortingFn: ((left, right) => {
        const a: number = left.getValue("xpRatio");
        const b: number = right.getValue("xpRatio");
        return a === b ? 0 : a === undefined ? -1 : b === undefined ? 1 : a - b;
      }) as SortingFn<GemDetails>,
      filterFn: "inNumberRange",
      cell: (info) =>
        isNaN(info.getValue() as any)
          ? "n/a"
          : numeral((info.getValue() as number).toPrecision(3)).format("0[.][00]a"),
    },
    {
      id: "ratio",
      header: "Best ratio",
      accessorFn: (original) =>
        getRatios(
          original,
          currencyMap.value,
          costOfTemple,
          costOfAwakenedLevel,
          costOfAwakenedReroll
        )[0]?.ratio,
      cell: ({ row: { original } }) => {
        const ratios = getRatios(
          original,
          currencyMap.value,
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
          "n/a"
        );
      },
    },
    {
      accessorKey: "gcpValue",
      header: "GCP",
      filterFn: "inNumberRange",
      sortingFn: (a, b) =>
        (a.original.gcpData?.[0]?.gcpValue || 0) - (b.original.gcpData?.[0]?.gcpValue || 0),
      cell: ({
        row: {
          original: { gcpData },
        },
      }) =>
        !gcpData?.length ? (
          "n/a"
        ) : (
          <span
            title={gcpData
              ?.map(
                ({ gcpValue, Level, Quality, Listings, Price }, i) =>
                  `Earn ${numeral(gcpValue).format(
                    "0[.][00]"
                  )}c upgrading this gem to ${Level}/${Quality} (${Listings} listed at ${Price}c)`
              )
              .join("\n")}>
            {Math.round(gcpData[0].gcpValue)}c
          </span>
        ),
    },
    {
      id: "regrValue",
      accessorFn: getRegrValue,
      sortingFn: (({ original: left }, { original: right }) => {
        const a = getRegrValue(left);
        const b = getRegrValue(right);
        return a === b ? 0 : a === undefined ? -1 : b === undefined ? 1 : a - b;
      }) as SortingFn<GemDetails>,
      header: "Regrading",
      filterFn: "inNumberRange",
      cell: ({
        row: {
          original,
          original: { Name, Price, regrValue, regrData },
        },
      }) =>
        !regrData?.length ? (
          "n/a"
        ) : (
          <span
            title={regrData
              ?.map(
                ({ gem, chance }) =>
                  `${numeral(chance * 100).format("0[.][00]")}% ${Math.round(
                    gem.Price -
                      Price -
                      (Name.includes("Support")
                        ? secRegrading ||
                          getCurrency("Secondary Regrading Lens", currencyMap.value, 0)
                        : primeRegrading ||
                          getCurrency("Prime Regrading Lens", currencyMap.value, 0))
                  )}c: ${gem.Level}/${gem.Quality} ${gem.Name} (${
                    gem.Price ? `${gem.Listings} at ${gem.Price}c` : "low confidence"
                  })`
              )
              .join("\n")}>
            {Math.round(getRegrValue(original))}c
          </span>
        ),
    },
    {
      accessorKey: "vaalValue",
      header: "Vaal",
      filterFn: "inNumberRange",
      cell: ({
        row: {
          original: { vaalValue, vaalData },
        },
      }) =>
        vaalValue ? (
          <span
            title={vaalData
              ?.map(
                ({ gem, chance, outcomes: [outcome] }) =>
                  `${numeral(chance * 100).format("0[.][00]")}% ${outcome}: ${gem.Level}/${
                    gem.Quality
                  }${
                    gem.Listings === 0 &&
                    (outcome === "Add quality" || outcome === "Remove quality")
                      ? "+"
                      : ""
                  } ${gem.Name} (${
                    gem.Price ? `${gem.Listings} at ${gem.Price}c` : "low confidence"
                  })`
              )
              .join("\n")}>
            {Math.round(vaalValue)}c
          </span>
        ) : (
          "n/a"
        ),
    },
    {
      id: "templeValue",
      accessorFn: ({ templeValue }) => templeValue && templeValue - costOfTemple,
      header: "Temple",
      filterFn: "inNumberRange",
      cell: ({
        row: {
          original: { templeValue, templeData },
        },
      }) =>
        templeValue ? (
          <span
            title={templeData
              ?.map(
                ({ gem, chance }) =>
                  `${numeral(chance * 100).format("0[.][00]")} %: ${gem.Level} / ${gem.Quality} ${
                    gem.Name
                  } (${gem.Price ? `${gem.Listings} at ${gem.Price}c` : "low confidence"})`
              )
              .join("\n")}>
            {Math.round(templeValue - costOfTemple)}c
          </span>
        ) : (
          "n/a"
        ),
    },
    {
      id: "levelValue",
      accessorFn: ({ levelValue }) => levelValue - costOfAwakenedLevel,
      header: "Wild Brambleback",
      sortingFn: (({ original: { levelValue: a } }, { original: { levelValue: b } }) =>
        a === b ? 0 : a === undefined ? -1 : b === undefined ? 1 : a - b) as SortingFn<GemDetails>,
      filterFn: "inNumberRange",
      cell: ({
        row: {
          original: { levelData },
        },
      }) =>
        !levelData?.length ? (
          "n/a"
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
        ),
    },
    {
      id: "convertValue",
      accessorFn: ({ convertValue }) => convertValue && convertValue - costOfAwakenedReroll,
      header: "Vivid Watcher",
      sortingFn: (({ original: { convertValue: a } }, { original: { convertValue: b } }) =>
        a === b ? 0 : a === undefined ? -1 : b === undefined ? 1 : a - b) as SortingFn<GemDetails>,
      filterFn: "inNumberRange",
      cell: ({
        row: {
          original: { convertValue },
        },
      }) => (convertValue ? Math.round(convertValue - costOfAwakenedReroll) + "c" : "n/a"),
    },
    {
      accessorKey: "Meta",
      filterFn: "inNumberRange",
      enableColumnFilter: !!league?.indexed,
      cell: ({
        row: {
          original: { Meta, Name: Gem },
        },
      }) =>
        Meta ? (
          <a
            href={`https://poe.ninja/${league?.url}/builds?allskill=${Gem.replaceAll(" ", "-")}`}
            target="_blank"
            rel="noreferrer">
            {Meta} %
          </a>
        ) : (
          "n/a"
        ),
    },
    {
      accessorKey: "Listings",
      filterFn: "inNumberRange",
      cell: ({
        row: {
          original: { Listings, Name: Gem },
        },
      }) => (
        <a
          href={`https://poe.ninja/${league?.url}/skill-gems?name=${Gem}`}
          target="_blank"
          rel="noreferrer">
          {Listings}
        </a>
      ),
    },
    {
      accessorKey: "lowConfidence",
      header: "Low confidence",
      filterFn: "equals",
      cell: (info) => (info.getValue() ? "✓" : "✗"),
    },
  ];
}
