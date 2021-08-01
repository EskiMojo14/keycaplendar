import isEqual from "lodash.isequal";
import { is } from "typescript-is";
import firebase from "@s/firebase";
import { queue } from "~/app/snackbarQueue";
import store from "~/app/store";
import { auditProperties } from "@s/audit/constants";
import { alphabeticalSortProp, uniqueArray } from "@s/common/functions";
import { getSetById } from "@s/main/functions";
import { selectProcessedActions, setLoading, setProcessedActions, setRecentSets, setTab } from ".";
import { HistoryTab, ProcessedPublicActionType, PublicActionType, RecentSet } from "./types";

const { dispatch } = store;

export const setHistoryTab = (tab: HistoryTab, clearUrl = true, state = store.getState()) => {
  const {
    history: { tab: historyTab },
  } = state;
  if (historyTab !== tab) {
    document.documentElement.scrollTop = 0;
    dispatch(setTab(tab));
  }
  if (clearUrl) {
    const params = new URLSearchParams(window.location.search);
    if (params.has("historyTab")) {
      params.delete("historyTab");
      const questionParam = params.has("page") ? "?" + params.toString() : "/";
      window.history.pushState({}, "KeycapLendar", questionParam);
    }
  }
};

export const getData = () => {
  const cloudFn = firebase.functions().httpsCallable("getPublicAudit");
  dispatch(setLoading(true));
  cloudFn({ num: 25 })
    .then((result) => {
      const actions: PublicActionType[] = result.data;
      processActions(actions);
    })
    .catch((error) => {
      console.log(error);
      queue.notify({ title: "Failed to get changelog: " + error });
    });
};

export const processActions = (actions: PublicActionType[]) => {
  const processedActions: ProcessedPublicActionType[] = actions.map((action) => {
    const { before, after, ...restAction } = action;
    const title =
      action.action !== "deleted"
        ? `${action.after.profile} ${action.after.colorway}`
        : `${action.before.profile} ${action.before.colorway}`;
    if (before && after) {
      auditProperties.forEach((prop) => {
        const beforeProp = before[prop];
        const afterProp = after[prop];
        if (
          isEqual(beforeProp, afterProp) ||
          (!is<boolean>(beforeProp) && !beforeProp && !is<boolean>(afterProp) && !afterProp)
        ) {
          delete before[prop];
          delete after[prop];
        }
      });
    }
    return {
      ...restAction,
      before,
      after,
      title,
    };
  });
  dispatch(setProcessedActions(processedActions));
  dispatch(setLoading(false));
};

export const generateSets = (state = store.getState()) => {
  const actions = selectProcessedActions(state);
  const ids = uniqueArray(actions.map((action) => action.documentId));
  const recentSets: RecentSet[] = ids.map((id) => {
    const filteredActions = alphabeticalSortProp(
      actions.filter((action) => action.documentId === id),
      "timestamp",
      true
    );
    const latestTimestamp = filteredActions[0].timestamp;
    const title = filteredActions[0].title;
    const designer = filteredActions[0].after.designer
      ? filteredActions[0].after.designer
      : filteredActions[0].before.designer
      ? filteredActions[0].before.designer
      : null;
    const deleted = filteredActions[0].action === "deleted";
    return {
      id: id,
      title: title,
      designer: designer,
      deleted: deleted,
      currentSet: getSetById(id),
      latestTimestamp: latestTimestamp,
    };
  });
  alphabeticalSortProp(recentSets, "latestTimestamp", true);
  dispatch(setRecentSets(recentSets));
};
