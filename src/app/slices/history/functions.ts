import isEqual from "lodash.isequal";
import { is } from "typescript-is";
import { queue } from "~/app/snackbar-queue";
import store from "~/app/store";
import { auditProperties } from "@s/audit/constants";
import firebase from "@s/firebase";
import { getSetById } from "@s/main/functions";
import { alphabeticalSortProp, removeDuplicates } from "@s/util/functions";
import {
  selectProcessedActions,
  selectTab,
  setLoading,
  setProcessedActions,
  setRecentSets,
  setTab,
} from ".";
import type {
  HistoryTab,
  ProcessedPublicActionType,
  PublicActionType,
  RecentSet,
} from "./types";

const { dispatch } = store;

export const setHistoryTab = (
  tab: HistoryTab,
  clearUrl = true,
  state = store.getState()
) => {
  const historyTab = selectTab(state);
  if (historyTab !== tab) {
    document.documentElement.scrollTop = 0;
    dispatch(setTab(tab));
  }
  if (clearUrl) {
    const params = new URLSearchParams(window.location.search);
    if (params.has("historyTab")) {
      params.delete("historyTab");
      const questionParam = params.has("page") ? `?${params}` : "/";
      window.history.pushState({}, "KeycapLendar", questionParam);
    }
  }
};

export const processActions = (
  actions: PublicActionType[]
): ProcessedPublicActionType[] =>
  actions.map((action) => {
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
  });

export const getData = () => {
  const cloudFn = firebase.functions().httpsCallable("getPublicAudit");
  dispatch(setLoading(true));
  cloudFn({ num: 25 })
    .then(({ data: actions }) => {
      dispatch(setProcessedActions(processActions(actions)));
      dispatch(setLoading(false));
    })
    .catch((error) => {
      console.log(error);
      queue.notify({ title: `Failed to get changelog: ${error}` });
    });
};

export const generateSets = (state = store.getState()) => {
  const actions = selectProcessedActions(state);
  const ids = removeDuplicates(actions.map((action) => action.documentId));
  const recentSets: RecentSet[] = ids.map((id) => {
    const filteredActions = alphabeticalSortProp(
      actions.filter((action) => action.documentId === id),
      "timestamp",
      true
    );
    const [latestTimestamp] = filteredActions
      .map((action) => action.timestamp)
      .filter(Boolean);
    const [title] = filteredActions
      .map((action) => action.title)
      .filter(Boolean);
    const [designer] = filteredActions
      .map((action) => action.after.designer || action.before.designer)
      .filter(Boolean);
    const deleted = filteredActions[0].action === "deleted";
    const currentSet = getSetById(id, state);
    return {
      currentSet,
      deleted,
      designer: designer ?? currentSet?.designer ?? null,
      id,
      latestTimestamp,
      title,
    };
  });
  alphabeticalSortProp(recentSets, "latestTimestamp", true);
  dispatch(setRecentSets(recentSets));
};
