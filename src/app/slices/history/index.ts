import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import type { Dictionary, EntityId, EntityState } from "@reduxjs/toolkit";
import isEqual from "lodash.isequal";
import { combineListeners } from "@mw/listener/functions";
import baseApi from "@s/api";
import { createErrorMessagesListeners } from "@s/api/functions";
import { auditProperties } from "@s/audit/constants";
import firebase from "@s/firebase";
import type { SetType } from "@s/main/types";
import {
  alphabeticalSortProp,
  alphabeticalSortPropCurried,
  removeDuplicates,
} from "@s/util/functions";
import type {
  ProcessedPublicActionType,
  PublicActionType,
  RecentSet,
} from "./types";

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
        (!(typeof beforeProp === "boolean") &&
          !beforeProp &&
          !(typeof afterProp === "boolean") &&
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

export const processedActionsAdapter =
  createEntityAdapter<ProcessedPublicActionType>({
    selectId: ({ changelogId }) => changelogId,
    sortComparer: alphabeticalSortPropCurried("timestamp", true),
  });

export const recentSetsAdapter = createEntityAdapter<RecentSet>({
  selectId: ({ id }) => id,
  sortComparer: alphabeticalSortPropCurried("latestTimestamp", true),
});

const getPublicAudit = firebase.functions().httpsCallable("getPublicAudit");

export const historyApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getChangelog: build.query<
      EntityState<ProcessedPublicActionType>,
      number | undefined
    >({
      queryFn: async (num = 25) => {
        try {
          return {
            data: processedActionsAdapter.setAll(
              processedActionsAdapter.getInitialState(),
              (await getPublicAudit({ num })).data.map(processAction)
            ),
          };
        } catch (error) {
          return { error };
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const { useGetChangelogQuery } = historyApi;

export const setupHistoryListeners = combineListeners((startListening) => [
  ...createErrorMessagesListeners(
    historyApi.endpoints,
    { getChangelog: "Failed to get changelog entries" },
    startListening
  ),
]);

export const {
  selectAll: selectProcessedActions,
  selectById: selectProcessedActionById,
  selectEntities: selectProcessedActionsMap,
  selectIds: selectProcessedActionsIds,
  selectTotal: selectProcessedActionsTotal,
} = processedActionsAdapter.getSelectors();

export const selectRecentSets = createSelector(
  selectProcessedActions,
  (_: unknown, setMap: Dictionary<SetType>) => setMap,
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

const {
  selectAll: selectAllRecent,
  selectEntities: selectRecentEntities,
  selectIds: selectRecentIds,
  selectTotal: selectRecentTotal,
} = recentSetsAdapter.getSelectors();

export const selectRecentSetIds = createSelector(
  selectRecentSets,
  selectRecentIds
);
export const selectRecentSetMap = createSelector(
  selectRecentSets,
  selectRecentEntities
);
export const selectRecentSetTotal = createSelector(
  selectRecentSets,
  selectRecentTotal
);
export const selectAllRecentSets = createSelector(
  selectRecentSets,
  selectAllRecent
);
export const selectRecentSetById = createSelector(
  selectRecentSetMap,
  (_: unknown, __: unknown, id: EntityId) => id,
  (recentSetMap, id) => recentSetMap[id]
);
