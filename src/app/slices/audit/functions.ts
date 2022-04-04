import isEqual from "lodash.isequal";
import { queue } from "~/app/snackbar-queue";
import store from "~/app/store";
import firestore from "@s/firebase/firestore";
import { alphabeticalSortProp } from "@s/util/functions";
import { selectLength, setAllActions, setLoading, setUsers } from ".";
import type { initialState } from ".";
import { auditProperties } from "./constants";
import type { ActionType } from "./types";

const { dispatch } = store;

export const filterActions = (
  actions: ActionType[],
  { action: filterAction, user: filterUser }: typeof initialState["filter"]
) => {
  let filteredActions = actions;

  if (filterAction !== "none") {
    filteredActions = filteredActions.filter(
      (action) => action.action === filterAction
    );
  }

  if (filterUser !== "all") {
    filteredActions = filteredActions.filter(
      (action) => action.user.nickname === filterUser
    );
  }

  return filteredActions.map(({ changelogId }) => changelogId);
};

const processActions = (actions: ActionType[]) =>
  actions.map((action) => {
    const { after, before, ...restAction } = action;
    if (before && after) {
      auditProperties.forEach((prop) => {
        const { [prop]: beforeProp } = before;
        const { [prop]: afterProp } = after;
        if (
          isEqual(beforeProp, afterProp) &&
          prop !== "profile" &&
          prop !== "colorway"
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
    };
  });

export const getActions = (state = store.getState()) => {
  const length = selectLength(state);
  dispatch(setLoading(true));
  firestore
    .collection("changelog")
    .orderBy("timestamp", "desc")
    .limit(length)
    .get()
    .then((querySnapshot) => {
      const actions: ActionType[] = [];
      const users: string[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const action = data.before?.profile
          ? data.after?.profile
            ? "updated"
            : "deleted"
          : "created";
        actions.push({
          ...data,
          action,
          changelogId: doc.id,
        });
        if (!users.includes(data.user.nickname)) {
          users.push(data.user.nickname);
        }
      });

      alphabeticalSortProp(actions, "timestamp", true);

      dispatch([setUsers(users), setAllActions(processActions(actions))]);
    })
    .catch((error) => {
      queue.notify({ title: `Error getting data: ${error}` });
    })
    .finally(() => {
      dispatch(setLoading(false));
    });
};
