import { createSelector } from "@reduxjs/toolkit";
import { ColumnDef, SortingFn } from "@tanstack/react-table";
import { Price } from "components/columns/Price";
import { GemDetails, getRatios } from "models/gems";
import numeral from "numeral";
import { currencyMap } from "state/api";
import { RootState as AppState } from "state/store";
import {
  awakenedLevelCost,
  awakenedRerollCost,
  regradeValue,
  templeCost,
} from "../state/selectors/costs";
import { AwakenedLevel } from "./columns/AwakenedLevel";
import { AwakenedReroll } from "./columns/AwakenedReroll";
import { GCP } from "./columns/GCP";
import { GraphCell } from "./columns/Graph";
import { Listings } from "./columns/Listings";
import { Meta } from "./columns/Meta";
import { Name } from "./columns/Name";
import { ROI } from "./columns/ROI";
import { Regrade } from "./columns/Regrade";
import { Temple } from "./columns/Temple";
import { Type } from "./columns/Type";
import { Vaal } from "./columns/Vaal";
import { XP } from "./columns/XP";

export const getColumns = createSelector(
  [
    ({ app }: AppState) => app.league,
    ({ app }: AppState) => app.fiveWay.debounced,
    currencyMap,
    templeCost,
    awakenedLevelCost,
    awakenedRerollCost,
    regradeValue,
    ({ app }: AppState) => app.enableColumnFilter,
  ],
  (
    league,
    fiveWay,
    currencyMap,
    costOfTemple,
    costOfAwakenedLevel,
    costOfAwakenedReroll,
    getRegrValue,
    enableColumnFilter
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
        cell: (info) => <Type gem={info.row.original} />,
      },
      {
        accessorKey: "Price",
        enableColumnFilter,
        filterFn: "inNumberRange",
        size: 140,
        meta: {
          filter: { isMin: true, isMax: true },
        },
        cell: ({ row: { original } }) => <Price original={original} />,
      },
      {
        id: "Profit",
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
        cell: ({ row: { original } }) => <ROI gem={original} />,
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
        cell: ({ row: { original } }) => <Regrade gem={original} />,
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
        cell: ({ row: { original } }) => <GCP gem={original} />,
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
        cell: ({ row: { original } }) => <XP gem={original} />,
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
  }
);
