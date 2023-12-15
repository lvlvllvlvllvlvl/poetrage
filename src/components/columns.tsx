import { createSelector } from "@reduxjs/toolkit";
import { ColumnDef, SortingFn } from "@tanstack/react-table";
import { Price } from "components/cells/Price";
import { GemDetails, getRatios } from "models/gems";
import numeral from "numeral";
import { currencyMap } from "state/api";
import { RootState as AppState } from "state/store";
import { awakenedLevelCost, awakenedRerollCost, templeCost } from "../state/selectors/costs";
import { AwakenedLevel } from "./cells/AwakenedLevel";
import { AwakenedReroll } from "./cells/AwakenedReroll";
import { GCP } from "./cells/GCP";
import { GraphCell } from "./cells/Graph";
import { Listings } from "./cells/Listings";
import { Meta } from "./cells/Meta";
import { Name } from "./cells/Name";
import { Pinned } from "./cells/Pinned";
import { Quality } from "./cells/Quality";
import { ROI } from "./cells/ROI";
import { Temple } from "./cells/Temple";
import { Vaal } from "./cells/Vaal";
import { XP } from "./cells/XP";

export const getColumns = createSelector(
  [
    ({ app }: AppState) => app.league,
    ({ app }: AppState) => app.fiveWay.debounced,
    ({ app }: AppState) => app.enableColumnFilter,
    ({ app }: AppState) => app.devMode,
    currencyMap,
    templeCost,
    awakenedLevelCost,
    awakenedRerollCost,
  ],
  (
    league,
    fiveWay,
    enableColumnFilter,
    devMode,
    currencyMap,
    costOfTemple,
    costOfAwakenedLevel,
    costOfAwakenedReroll,
  ): ColumnDef<GemDetails>[] => {
    return [
      {
        accessorKey: "Name",
        filterFn: "search" as any,
        meta: {
          filter: { isText: true },
        },
        size: 400,
        cell: (info) => <Name gem={info.row.original} />,
      },
      {
        accessorKey: "Pinned",
        size: devMode ? 80 : 40,
        cell: (info) => <Pinned gem={info.row.original} />,
      },
      {
        accessorKey: "Color",
        size: 80,
        enableColumnFilter,
        filterFn: "includes" as any,
        meta: {
          filter: { options: ["r", "g", "b", "w"] },
        },
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
        id: "Transfigured",
        accessorFn: ({ discriminator }: GemDetails) => Boolean(discriminator),
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
        size: 80,
        meta: {
          filter: { isMin: true, isMax: true },
        },
      },
      {
        accessorKey: "Quality",
        enableColumnFilter,
        filterFn: "inNumberRange",
        size: 80,
        meta: {
          filter: { isMin: true, isMax: true },
        },
        cell: (info) => <Quality gem={info.row.original} />,
      },
      {
        accessorKey: "Price",
        enableColumnFilter,
        filterFn: "inNumberRange",
        size: 140,
        meta: {
          filter: { isMin: true, isMax: true },
        },
        cell: ({ row: { original } }) => <Price gem={original} />,
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
            costOfAwakenedReroll,
          )[0]?.ratio,
        cell: ({ row: { original } }) => <ROI gem={original} />,
      },
      {
        id: "Profit",
        header: "Flowchart",
        accessorFn: (gem: GemDetails) => (gem.graph ? gem.graph.expectedValue - gem.Price : 0),
        enableColumnFilter,
        filterFn: "inNumberRange",
        meta: {
          filter: { isMin: true },
        },
        cell: ({
          row: {
            original: { graph },
          },
        }) => <GraphCell graph={graph} />,
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
        cell: ({ row: { original } }) => <Vaal gem={original} />,
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
        cell: ({ row: { original } }) => <Temple gem={original} />,
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
        sortUndefined: false,
        cell: ({ row: { original } }) => <GCP gem={original} />,
      },
      {
        id: "levelValue",
        accessorFn: ({ levelValue }) => (levelValue || 0) - costOfAwakenedLevel,
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
        cell: ({ row: { original } }) => <AwakenedLevel gem={original} />,
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
        sortUndefined: false,
        enableColumnFilter,
        filterFn: "inNumberRange",
        meta: {
          tooltip:
            "Average profit converting this gem to another awakened gem using a Vivid Watcher",
          filter: { isMin: true },
        },
        cell: ({ row: { original } }) => <AwakenedReroll gem={original} />,
      },
      {
        accessorKey: "XP",
        header: "Stored XP",
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
        sortUndefined: false,
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
        id: "5way",
        accessorFn: ({ xpValue }) => (xpValue || 0) * (fiveWay || 100),
        header: fiveWay ? "Per 5-way" : "100m XP",
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
          tooltip: `Profit per ${fiveWay || 100} million XP added to this gem.`,
          filter: { isMin: true },
        },
        cell: ({ row: { original } }) => <XP gem={original} />,
      },
      {
        id: "5wayRatio",
        accessorFn: ({ xpValue, Price }) => (xpValue ? (xpValue * (fiveWay || 100)) / Price : 0),
        header: "XP ROI",
        sortingFn: ((left, right) => {
          const a: number = left.getValue("5wayRatio");
          const b: number = right.getValue("5wayRatio");
          return a === b ? 0 : a === undefined ? -1 : b === undefined ? 1 : a - b;
        }) as SortingFn<GemDetails>,
        enableColumnFilter,
        filterFn: "inNumberRange",
        meta: {
          tooltip: `Profit per ${
            fiveWay ? "5-way" : "100 million XP"
          }, divided by the cost of the gem.`,
          filter: { isMin: true, isFloat: true },
        },
        cell: (info) =>
          isNaN(info.getValue() as any)
            ? "n/a"
            : numeral((info.getValue() as number).toPrecision(3)).format("0[.][00]a"),
      },
      {
        id: "Levelling",
        accessorFn: (gem: GemDetails) =>
          gem.xpGraph?.expectedValue
            ? Math.round(
                ((gem.xpGraph.expectedValue - gem.xpGraph.gem.Price) * (fiveWay || 100)) /
                  (gem.xpGraph.experience || 0),
              )
            : 0,
        enableColumnFilter,
        filterFn: "inNumberRange",
        meta: {
          filter: { isMin: true },
        },
        cell: ({
          row: {
            original: { xpGraph },
          },
        }) => <GraphCell xp graph={xpGraph} />,
      },
      {
        id: "xpRatio",
        accessorFn: ({ xpGraph }) => xpGraph?.roi,
        header: "Level ROI",
        sortingFn: ((left, right) => {
          const a: number = left.getValue("xpRatio");
          const b: number = right.getValue("xpRatio");
          return a === b ? 0 : a === undefined ? -1 : b === undefined ? 1 : a - b;
        }) as SortingFn<GemDetails>,
        enableColumnFilter,
        filterFn: "inNumberRange",
        sortUndefined: false,
        meta: {
          tooltip: "Leveling profit divided by costs. 5-way price not accounted for",
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
        cell: ({ row: { original } }) => <Meta gem={original} />,
      },
      {
        accessorKey: "Listings",
        enableColumnFilter,
        filterFn: "inNumberRange",
        meta: {
          tooltip: "Number of listings found by poe.ninja",
          filter: { isMin: true },
        },
        cell: ({ row: { original } }) => <Listings gem={original} />,
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
  },
);
