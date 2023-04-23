import { createSelector } from "@reduxjs/toolkit";
import { GemDetails, getId } from "models/gems";
import { RootState } from "state/store";

export const zippedData = createSelector(
  [(state: RootState) => state.app.data, (state: RootState) => state.app.graphData, (state: RootState) => state.app.pins, ],
  (data, graphData, pins) => data.map((gem): GemDetails => ({ ...gem, Pinned: pins.includes(getId(gem)), graph: graphData[getId(gem)] }))
);
