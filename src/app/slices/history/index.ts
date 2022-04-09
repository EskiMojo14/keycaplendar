import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { EntityState, PayloadAction } from "@reduxjs/toolkit";
import isEqual from "lodash.isequal";
import { is } from "typescript-is";
import { queue } from "~/app/snackbar-queue";
import type { AppThunk, RootState } from "~/app/store";
import { auditProperties } from "@s/audit/constants";
import firebase from "@s/firebase";
import { selectSetMap } from "@s/main";
import type { SetType } from "@s/main/types";
import {
  alphabeticalSortProp,
  alphabeticalSortPropCurried,
  createURL,
  removeDuplicates,
} from "@s/util/functions";
import type {
  HistoryTab,
  ProcessedPublicActionType,
  PublicActionType,
  RecentSet,
} from "./types";

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

export const setHistoryTab =
  (tab: HistoryTab, clearUrl = true): AppThunk<void> =>
  (dispatch, getState) => {
    const historyTab = selectTab(getState());
    console.log(tab, historyTab);
    if (historyTab !== tab) {
      document.documentElement.scrollTop = 0;
      dispatch(setTab(tab));
    }
    if (clearUrl) {
      const params = new URLSearchParams(window.location.search);
      if (params.has("historyTab")) {
        const newUrl = createURL({}, (params) => {
          params.delete("historyTab");
        });
        window.history.pushState({}, "KeycapLendar", newUrl);
      }
    }
  };

export const processAction = (
  action: PublicActionType
): ProcessedPublicActionType => {
  const { after, before, ...restAction } = action;
  const title =
    action.action !== "deleted"
      ? `${action.after.profile} ${action.after.colorway}`
      : `${action.before.profile} ${action.before.colorway}`;
  if (before && after) {
    auditProperties.forEach((prop) => {
      const { [prop]: beforeProp } = before;
      const { [prop]: afterProp } = after;
      if (
        isEqual(beforeProp, afterProp) ||
        (!is<boolean>(beforeProp) &&
          !beforeProp &&
          !is<boolean>(afterProp) &&
          !afterProp)
      ) {
        delete before[prop];
        delete after[prop];
      }
    });
  }
  return {
    ...restAction,
    after,
    before,
    title,
  };
};

export const getData = (): AppThunk<Promise<void>> => async (dispatch) => {
  const cloudFn = firebase.functions().httpsCallable("getPublicAudit");
  try {
    dispatch(setLoading(true));
    const { data: actions } = await cloudFn({ num: 25 });
    dispatch([
      setProcessedActions(actions.map(processAction)),
      setLoading(false),
    ]);
  } catch (error) {
    console.log(error);
    queue.notify({ title: `Failed to get changelog: ${error}` });
  }
};
