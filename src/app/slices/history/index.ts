import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import type { HistoryTab, ProcessedPublicActionType, RecentSet } from "./types";

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
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setTab: (state, { payload }: PayloadAction<HistoryTab>) => {
      state.tab = payload;
    },
    setProcessedActions: (state, { payload }: PayloadAction<ProcessedPublicActionType[]>) => {
      state.processedActions = payload;
    },
    setRecentSets: (state, { payload }: PayloadAction<RecentSet[]>) => {
      state.recentSets = payload;
    },
  },
});

export const {
  actions: { setLoading, setTab, setProcessedActions, setRecentSets },
} = historySlice;

export const selectLoading = (state: RootState) => state.history.loading;

export const selectTab = (state: RootState) => state.history.tab;

export const selectProcessedActions = (state: RootState) => state.history.processedActions;

export const selectRecentSets = (state: RootState) => state.history.recentSets;

export default historySlice.reducer;
