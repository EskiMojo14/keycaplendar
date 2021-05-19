import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { StatsTab } from "../../../util/types";

type StatisticsState = {
  tab: StatsTab;
};

const initialState: StatisticsState = {
  tab: "summary",
};

export const statisticsSlice = createSlice({
  name: "display",
  initialState,
  reducers: {
    setStatsTab: (state, action: PayloadAction<StatsTab>) => {
      state.tab = action.payload;
    },
  },
});

export const { setStatsTab } = statisticsSlice.actions;

export const selectStatsTab = (state: RootState) => state.statistics.tab;

export default statisticsSlice.reducer;
