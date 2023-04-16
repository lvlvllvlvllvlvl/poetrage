import { createSelector } from "@reduxjs/toolkit";
import { ColumnDef, SortingFn } from "@tanstack/react-table";
import "App.css";
import { getCurrency } from "apis/getCurrencyOverview";
import { EditOverride } from "components/Override";
import { GemDetails, getQuery, getRatios, isEqual } from "models/Gems";
import numeral from "numeral";
import { currencyMap, gemInfo } from "redux/api";
import { RootState as AppState } from "redux/store";
import {
  awakenedLevelCost,
  awakenedRerollCost,
  regradeValue,
  templeCost,
} from "../redux/selectors/costs";
import { GemIcons } from "./GemIcons";
import { qualityStat } from "functions/formatStat";
import Tooltip from "@mui/material/Tooltip";

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
    ({ app }: AppState) => app.enableColumnFilter,
  ],
  (
    league,
    overrides,
    gemInfo,
    fiveWay,
    currencyMap,
    costOfTemple,
    costOfAwakenedLevel,
    costOfAwakenedReroll,
    getRegrValue,
    secRegrading,
    primeRegrading,
    enableColumnFilter
  ): ColumnDef<GemDetails, GemDetails[keyof GemDetails]>[] => {
    return [
      {
        accessorKey: "Name",
        filterFn: "search" as any,
        meta: {
          filter: { isText: true },
        },
        size: 400,
        cell: (info) => (
          <>
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://www.pathofexile.com/trade/search/${league?.name}?q=${JSON.stringify(
                getQuery(info.row.original)
              )}`}>
              {info.getValue() as string}
            </a>
            <GemIcons gem={info.row.original} />
          </>
        ),
      },
      {
        accessorKey: "Corrupted",
        enableColumnFilter,
        filterFn: "equals",
        meta: {
          filter: { isBool: true },
        },
        cell: (info) => (info.getValue() ? "✓" : "✗"),
      },
      {
        accessorKey: "Level",
        enableColumnFilter,
        filterFn: "inNumberRange",
        meta: {
          filter: { isMin: true, isMax: true },
        },
      },
      {
        accessorKey: "Quality",
        enableColumnFilter,
        filterFn: "inNumberRange",
        meta: {
          filter: { isMin: true, isMax: true },
        },
      },
      {
        accessorKey: "Type",
        enableColumnFilter,
        filterFn: "includes" as any,
        meta: {
          filter: { isType: true },
        },
        cell: (info) => (
          <Tooltip
            title={
              gemInfo.status === "done" ? qualityStat(gemInfo.value, info.row.original) : undefined
            }>
            <span>{info.row.original.Type}</span>
          </Tooltip>
        ),
      },
      {
        accessorKey: "Price",
        enableColumnFilter,
        filterFn: "inNumberRange",
        meta: {
          filter: { isMin: true, isMax: true },
        },
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
        id: "ratio",
        header: "ROI",
        enableColumnFilter,
        filterFn: "inNumberRange",
        meta: {
          tooltip:
            "Net profit earnable by applying crafts to this gem, divided by the cost of the gem and the currency used",
          filter: { isMin: true, isFloat: true },
        },
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
        id: "regrValue",
        accessorFn: getRegrValue,
        sortingFn: (({ original: left }, { original: right }) => {
          const a = getRegrValue(left);
          const b = getRegrValue(right);
          return a === b ? 0 : a === undefined ? -1 : b === undefined ? 1 : a - b;
        }) as SortingFn<GemDetails>,
        header: "Regrading lens",
        enableColumnFilter,
        filterFn: "inNumberRange",
        meta: {
          tooltip: "Average profit when applying a regrading lens to this gem",
          filter: { isMin: true },
        },
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
                    } - ${gem.Meta}% meta)`
                )
                .join("\n")}>
              {Math.round(getRegrValue(original))}c
            </span>
          ),
      },
      {
        accessorKey: "vaalValue",
        header: "Vaal",
        enableColumnFilter,
        filterFn: "inNumberRange",
        meta: {
          tooltip: "Average profit for vaaling this gem",
          filter: { isMin: true },
        },
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
                    } ${gem.Name}${gem.Price ? ` (${gem.Listings} at ${gem.Price}c)` : ""}${
                      gem.lowConfidence ? " (low confidence)" : ""
                    }`
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
        enableColumnFilter,
        filterFn: "inNumberRange",
        meta: {
          tooltip: "Average profit when corrupting this gem with a Doryani's Institute",
          filter: { isMin: true },
        },
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
                    }${gem.Price ? ` (${gem.Listings} at ${gem.Price}c)` : ""}${
                      gem.lowConfidence ? " (low confidence)" : ""
                    }`
                )
                .join("\n")}>
              {Math.round(templeValue - costOfTemple)}c
            </span>
          ) : (
            "n/a"
          ),
      },
      {
        accessorKey: "gcpValue",
        header: "GCP",
        enableColumnFilter,
        filterFn: "inNumberRange",
        meta: {
          tooltip: "Potential profit from applying Gemcutter's Prisms to this gem",
          filter: { isMin: true },
        },
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
        id: "levelValue",
        accessorFn: ({ levelValue }) => levelValue - costOfAwakenedLevel,
        header: "Wild Brambleback",
        sortingFn: (({ original: { levelValue: a } }, { original: { levelValue: b } }) =>
          a === b
            ? 0
            : a === undefined
            ? -1
            : b === undefined
            ? 1
            : a - b) as SortingFn<GemDetails>,
        enableColumnFilter,
        filterFn: "inNumberRange",
        meta: {
          tooltip: "Profit from levelling this awakened gem up with a Wild Brambleback",
          filter: { isMin: true },
        },
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
          a === b
            ? 0
            : a === undefined
            ? -1
            : b === undefined
            ? 1
            : a - b) as SortingFn<GemDetails>,
        enableColumnFilter,
        filterFn: "inNumberRange",
        meta: {
          tooltip:
            "Average profit converting this gem to another awakened gem using a Vivid Watcher",
          filter: { isMin: true },
        },
        cell: ({
          row: {
            original: { convertValue },
          },
        }) => (convertValue ? Math.round(convertValue - costOfAwakenedReroll) + "c" : "n/a"),
      },
      {
        accessorKey: "XP",
        sortingFn: (({ original: { XP: a } }, { original: { XP: b } }) =>
          a === b
            ? 0
            : a === undefined
            ? -1
            : b === undefined
            ? 1
            : a - b) as SortingFn<GemDetails>,
        enableColumnFilter,
        filterFn: "inNumberRange",
        meta: {
          tooltip: "Amount of xp required to reach this gem level",
          filter: { isMin: true },
        },
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
          a === b
            ? 0
            : a === undefined
            ? -1
            : b === undefined
            ? 1
            : a - b) as SortingFn<GemDetails>,
        enableColumnFilter,
        filterFn: "inNumberRange",
        meta: {
          tooltip:
            "Profit from levelling this gem up, divided by estimated average gem xp earned in a 5-way",
          filter: { isMin: true },
        },
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
        header: "XP ROI",
        sortingFn: ((left, right) => {
          const a: number = left.getValue("xpRatio");
          const b: number = right.getValue("xpRatio");
          return a === b ? 0 : a === undefined ? -1 : b === undefined ? 1 : a - b;
        }) as SortingFn<GemDetails>,
        enableColumnFilter,
        filterFn: "inNumberRange",
        meta: {
          tooltip:
            "Profit per 5-way, divided by the cost of the gem. 5-way price not accounted for",
          filter: { isMin: true, isFloat: true },
        },
        cell: (info) =>
          isNaN(info.getValue() as any)
            ? "n/a"
            : numeral((info.getValue() as number).toPrecision(3)).format("0[.][00]a"),
      },
      {
        accessorKey: "Meta",
        filterFn: "inNumberRange",
        enableColumnFilter: enableColumnFilter && !!league?.indexed,
        meta: {
          tooltip: "Share of builds in the selected league and ladder that are using this gem",
          filter: { isMin: true, isFloat: true },
        },
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
        enableColumnFilter,
        filterFn: "inNumberRange",
        meta: {
          tooltip: "Number of listings found by poe.ninja",
          filter: { isMin: true },
        },
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
        enableColumnFilter,
        filterFn: "equals",
        meta: {
          tooltip: "Price data may be inaccurate",
          filter: { isBool: true },
        },
        cell: (info) => (info.getValue() ? "✓" : "✗"),
      },
    ];
  }
);
