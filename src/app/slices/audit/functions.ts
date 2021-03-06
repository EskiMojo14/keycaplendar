import isEqual from "lodash.isequal";
import { queue } from "~/app/snackbarQueue";
import store from "~/app/store";
import {
  selectAllActions,
  selectFilterAction,
  selectFilterUser,
  selectLength,
  setAllActions,
  setFilteredActions,
  setLoading,
  setUsers,
} from "./auditSlice";
import { auditProperties } from "./constants";
import { ActionType } from "./types";
import { alphabeticalSortProp } from "@s/common/functions";
import { typedFirestore } from "@s/firebase/firestore";

const { dispatch } = store;

export const getActions = (state = store.getState()) => {
  const length = selectLength(state);
  dispatch(setLoading(true));
  typedFirestore
    .collection("changelog")
    .orderBy("timestamp", "desc")
    .limit(length)
    .get()
    .then((querySnapshot) => {
      const actions: ActionType[] = [];
      const users: string[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const action =
          data.before && data.before.profile ? (data.after && data.after.profile ? "updated" : "deleted") : "created";
        const changelogId = doc.id;
        const actionObj: ActionType = {
          ...data,
          action,
          changelogId,
        };
        actions.push(actionObj);
        if (!users.includes(data.user.nickname)) {
          users.push(data.user.nickname);
        }
      });

      alphabeticalSortProp(actions, "timestamp", true);

      dispatch(setUsers(users));

      processActions(actions);
    })
    .catch((error) => {
      queue.notify({ title: "Error getting data: " + error });
      dispatch(setLoading(false));
    });
};

const processActions = (actions: ActionType[]) => {
  const processedActions: ActionType[] = actions.map((action) => {
    const { before, after, ...restAction } = action;
    if (before && after) {
      auditProperties.forEach((prop) => {
        const beforeProp = before[prop];
        const afterProp = after[prop];
        if (isEqual(beforeProp, afterProp) && prop !== "profile" && prop !== "colorway") {
          delete before[prop];
          delete after[prop];
        }
      });
    }
    return {
      ...restAction,
      before,
      after,
    };
  });

  dispatch(setAllActions(processedActions));

  filterActions(store.getState());
};

export const filterActions = (state = store.getState()) => {
  const allActions = selectAllActions(state);
  const filterAction = selectFilterAction(state);
  const filterUser = selectFilterUser(state);

  let filteredActions = allActions;

  if (filterAction !== "none") {
    filteredActions = filteredActions.filter((action) => {
      return action.action === filterAction;
    });
  }

  if (filterUser !== "all") {
    filteredActions = filteredActions.filter((action) => {
      return action.user.nickname === filterUser;
    });
  }

  dispatch(setFilteredActions(filteredActions));

  dispatch(setLoading(false));
};
