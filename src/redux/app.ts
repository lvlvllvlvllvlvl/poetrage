import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { GemDetails, Override, isEqual } from "models/Gems";
import { League } from "models/ninja/Leagues";
import { AppDispatch } from "./store";
import { memoize } from "lodash";

function prop<T>(): { type: "simple"; value: T | undefined };
function prop<T>(value: T): { type: "simple"; value: T };
function prop<T>(value?: T) {
  return { type: "simple", value };
}
function debouncedProp<T>(): {
  type: "debounced";
  value: { value: T | undefined; debounced: T | undefined };
};
function debouncedProp<T>(value: T): { type: "debounced"; value: { value: T; debounced: T } };
function debouncedProp<T>(value?: T) {
  return { type: "debounced", value: { value, debounced: value } };
}

export const fields = {
  league: prop<League>(),
  ladder: prop<"exp" | "depthsolo">("exp"),
  sorting: prop<SortingState>([]),
  columnFilters: prop<ColumnFiltersState>([
    { id: "Meta", value: [0.4, undefined] },
    { id: "lowConfidence", value: false },
  ]),
  savedColumnFilters: prop<ColumnFiltersState>(),
  enableColumnFilter: prop(true),
  sanitize: prop<"yes" | "no" | "corrupted">("yes"),
  showOptions: prop(false),
  lowConfidence: prop(false),
  progress: prop(0),
  progressMsg: prop(""),
  data: prop<GemDetails[]>([]),
  load: prop(0),
  overridesTmp: prop<Override[]>([]),
  overrides: prop<Override[]>([]),
  templePrice: debouncedProp(0),
  awakenedLevelPrice: debouncedProp(0),
  awakenedRerollPrice: debouncedProp(0),
  mavenExclusiveWeight: debouncedProp(90),
  mavenCrucibleWeight: debouncedProp(500),
  primeRegrading: debouncedProp(0),
  secRegrading: debouncedProp(0),
  filterMeta: debouncedProp(0.2),
  incQual: debouncedProp(30),
  fiveWay: debouncedProp(100),
};

type Fields = typeof fields;
export type AppState = { [k in keyof Fields]: Fields[k]["value"] };

export const initialState = Object.keys(fields).reduce((acc, key: any) => {
  acc[key] = fields[key as keyof AppState].value;
  return acc;
}, {} as any) as AppState;

type PickFields<T extends Fields[keyof Fields]["type"]> = {
  [K in keyof Fields]: Fields[K]["type"] extends T ? K : never;
}[keyof Fields];

type SetterNames = {
  [K in PickFields<"simple" | "debounced">]: `set${Capitalize<K>}`;
};

export type Setters = {
  [Name in SetterNames[keyof SetterNames]]: {
    [Field in keyof SetterNames]: SetterNames[Field] extends Name
      ? Fields[Field] extends { type: "simple"; value: infer Value }
        ? (value: Value) => void
        : Fields[Field] extends { type: "debounced"; value: { value: infer Value } }
        ? (value: Value) => void
        : never
      : never;
  }[keyof SetterNames];
};

const timeouts = {} as { [key: string]: NodeJS.Timeout };

export const setters = memoize(
  (dispatch: AppDispatch) =>
    Object.keys(fields).reduce((acc, key: any) => {
      acc[("set" + key.charAt(0).toUpperCase() + key.substring(1)) as keyof Setters] = (
        value: any
      ) => {
        switch (fields[key as keyof AppState].type) {
          case "simple":
            dispatch(actions.setSimple({ key, value }));
            return;
          case "debounced":
            dispatch(actions.setDebounced({ key, value, type: "value" }));
            clearTimeout(timeouts[key]);
            timeouts[key] = setTimeout(() =>
              dispatch(actions.setDebounced({ key, value, type: "debounced" }))
            );
        }
      };
      return acc;
    }, {} as Setters),
  (dispatch) => dispatch
);

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setSimple: <K extends PickFields<"simple">>(
      state: AppState,
      { payload: { key, value } }: PayloadAction<{ key: K; value: AppState[K] }>
    ) => {
      return { ...state, [key]: value };
    },
    setDebounced: <K extends PickFields<"debounced">>(
      state: AppState,
      {
        payload: { key, type, value },
      }: PayloadAction<{ key: K; type: "value" | "debounced"; value: AppState[K] }>
    ) => {
      return { ...state, [key]: { ...state[key], [type]: value } };
    },
    setOverride: (state: AppState, { payload }: PayloadAction<Override | Override[]>) => {
      if (Array.isArray(payload)) {
        return { ...state, overridesTmp: payload };
      }
      if (payload.override.isOverride !== true) {
        console.warn("unmarked override");
      }
      let found = false;
      const overridesTmp = state.overridesTmp.map((o) => {
        if (
          (o.original && payload.original && isEqual(o.original, payload.original)) ||
          (!o.original && !payload.original && isEqual(o.override, payload.override))
        ) {
          found = true;
          return payload;
        } else {
          return o;
        }
      });
      if (!found) {
        overridesTmp.push(payload);
      }
      return { ...state, overridesTmp };
    },
    reload: (state) => ({ ...state, load: state.load + 1 }),
  },
});

export const { actions } = appSlice;
