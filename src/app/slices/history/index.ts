import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { EntityState, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { selectSetMap } from "@s/main";
import type { SetType } from "@s/main/types";
import {
  alphabeticalSortProp,
  alphabeticalSortPropCurried,
  removeDuplicates,
} from "@s/util/functions";
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
  tab: HistoryTab;
};

export const initialState: HistoryState = {
  loading: false,
  processedActions: processedActionsAdapter.getInitialState(),
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
    setTab: (state, { payload }: PayloadAction<HistoryTab>) => {
      state.tab = payload;
    },
  },
});

export const {
  actions: { setLoading, setProcessedActions, setTab },
} = historySlice;

export const selectLoading = (state: RootState) => state.history.loading;

export const {
  selectAll: selectProcessedActions,
  selectById: selectProcessedActionById,
  selectEntities: selectProcessedActionsMap,
  selectIds: selectProcessedActionsIds,
  selectTotal: selectProcessedActionsTotal,
} = processedActionsAdapter.getSelectors<RootState>(
  (state) => state.history.processedActions
);

export const selectRecentSets = createSelector(
  selectProcessedActions,
  selectSetMap,
  (processedActions, setMap) =>
    recentSetsAdapter.setAll(
      recentSetsAdapter.getInitialState(),
      removeDuplicates(
        processedActions.map((action) => action.documentId)
      ).map<RecentSet>((id) => {
        const filteredActions = alphabeticalSortProp(
          processedActions.filter((action) => action.documentId === id),
          "timestamp",
          true
        );
        const {
          designer,
          latestTimestamp = "",
          title = "",
        } = filteredActions.reduce<{
          designer?: SetType["designer"];
          latestTimestamp?: ProcessedPublicActionType["timestamp"];
          title?: ProcessedPublicActionType["title"];
        }>((acc, action) => {
          if (action.timestamp) {
            acc.latestTimestamp ??= action.timestamp;
          }
          if (action.title) {
            acc.title ??= action.title;
          }
          if (action.after.designer || action.before.designer) {
            acc.designer ??= action.after.designer || action.before.designer;
          }
          return acc;
        }, {});
        const deleted = filteredActions[0].action === "deleted";
        const { [id]: currentSet } = setMap;
        return {
          deleted,
          designer: currentSet?.designer ?? designer,
          id,
          latestTimestamp,
          title,
        };
      })
    )
);

export const {
  selectAll: selectAllRecentSets,
  selectById: selectRecentSetById,
  selectEntities: selectRecentSetsMap,
  selectIds: selectRecentSetsIds,
  selectTotal: selectRecentSetsTotal,
} = recentSetsAdapter.getSelectors<RootState>(selectRecentSets);

export default historySlice.reducer;
