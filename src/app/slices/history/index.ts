import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { HistoryTab, ProcessedPublicActionType, RecentSet } from "./types";

type HistoryState = {
  tab: HistoryTab;
  loading: boolean;

  processedActions: ProcessedPublicActionType[];
  recentSets: RecentSet[];
};

export const initialState: HistoryState = {
  tab: "recent",
  loading: false,

  processedActions: [],
  recentSets: [],
};

export const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    setTab: (state, action: PayloadAction<HistoryTab>) => {
      state.tab = action.payload;
      scrollTo(0, 0);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setProcessedActions: (state, action: PayloadAction<ProcessedPublicActionType[]>) => {
      state.processedActions = action.payload;
    },
    setRecentSets: (state, action: PayloadAction<RecentSet[]>) => {
      state.recentSets = action.payload;
    },
  },
});

export const { setTab, setLoading, setProcessedActions, setRecentSets } = historySlice.actions;

export const selectTab = (state: RootState) => state.history.tab;

export const selectLoading = (state: RootState) => state.history.loading;

export const selectProcessedActions = (state: RootState) => state.history.processedActions;

export const selectRecentSets = (state: RootState) => state.history.recentSets;

export default historySlice.reducer;
