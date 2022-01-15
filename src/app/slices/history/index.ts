import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { EntityState, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { alphabeticalSortPropCurried } from "@s/util/functions";
import type { HistoryTab, ProcessedPublicActionType, RecentSet } from "./types";

export const processedActionsAdapter =
  createEntityAdapter<ProcessedPublicActionType>({
    selectId: ({ changelogId }) => changelogId,
    sortComparer: alphabeticalSortPropCurried("timestamp", true),
  });

export const recentSetsAdapter = createEntityAdapter<RecentSet>({
  selectId: ({ id }) => id,
  sortComparer: alphabeticalSortPropCurried("latestTimestamp", true),
});

type HistoryState = {
  loading: boolean;
  processedActions: EntityState<ProcessedPublicActionType>;
  recentSets: EntityState<RecentSet>;
  tab: HistoryTab;
};

export const initialState: HistoryState = {
  loading: false,
  processedActions: processedActionsAdapter.getInitialState(),
  recentSets: recentSetsAdapter.getInitialState(),
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
      processedActionsAdapter.setAll(state.processedActions, payload);
    },
    setRecentSets: (state, { payload }: PayloadAction<RecentSet[]>) => {
      recentSetsAdapter.setAll(state.recentSets, payload);
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

export const {
  selectAll: selectProcessedActions,
  selectById: selectProcessedActionById,
  selectEntities: selectProcessedActionsMap,
  selectIds: selectProcessedActionsIds,
  selectTotal: selectProcessedActionsTotal,
} = processedActionsAdapter.getSelectors<RootState>(
  (state) => state.history.processedActions
);

export const {
  selectAll: selectRecentSets,
  selectById: selectRecentSetById,
  selectEntities: selectRecentSetsMap,
  selectIds: selectRecentSetsIds,
  selectTotal: selectRecentSetsTotal,
} = recentSetsAdapter.getSelectors<RootState>(
  (state) => state.history.recentSets
);

export default historySlice.reducer;
