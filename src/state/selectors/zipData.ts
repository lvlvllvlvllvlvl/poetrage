import { createSelector } from "@reduxjs/toolkit";
import { GemDetails, getId } from "models/gems";
import { RootState } from "state/store";

export const zippedData = createSelector(
  [(state: RootState) => state.app.data, (state: RootState) => state.app.graphData],
  (data, graphData) => data.map((gem): GemDetails => ({ ...gem, graph: graphData[getId(gem)] }))
);
