import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import type { HistoryTab, ProcessedPublicActionType, RecentSet } from "./types";

type HistoryState = {
  loading: boolean;
  processedActions: ProcessedPublicActionType[];
  recentSets: RecentSet[];
  tab: HistoryTab;
};

export const initialState: HistoryState = {
  loading: false,
  processedActions: [],
  recentSets: [],
  tab: "recent",
};

export const historySlice = createSlice({
  initialState,
  name: "history",
  reducers: {
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setProcessedActions: (
      state,
      { payload }: PayloadAction<ProcessedPublicActionType[]>
    ) => {
      state.processedActions = payload;
    },
    setRecentSets: (state, { payload }: PayloadAction<RecentSet[]>) => {
      state.recentSets = payload;
    },
    setTab: (state, { payload }: PayloadAction<HistoryTab>) => {
      state.tab = payload;
    },
  },
});

export const {
  actions: { setLoading, setProcessedActions, setRecentSets, setTab },
} = historySlice;

export const selectLoading = (state: RootState) => state.history.loading;

export const selectTab = (state: RootState) => state.history.tab;

export const selectProcessedActions = (state: RootState) =>
  state.history.processedActions;

export const selectRecentSets = (state: RootState) => state.history.recentSets;

export default historySlice.reducer;
