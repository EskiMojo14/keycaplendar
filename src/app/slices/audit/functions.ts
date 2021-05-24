import isEqual from "lodash.isequal";
import firebase from "../../../firebase";
import { queue } from "../../snackbarQueue";
import store from "../../store";
import { setAllActions, setFilteredActions, setLength, setLoading, setUsers } from "./auditSlice";
import { auditProperties } from "./constants";
import { ActionType } from "./types";
import { alphabeticalSortProp } from "../common/functions";

const db = firebase.firestore();

const { dispatch } = store;

export const getActions = (num?: number) => {
  const {
    audit: { length },
  } = store.getState();
  const auditLength = num || length;
  dispatch(setLoading(true));
  if (auditLength !== length) {
    dispatch(setLength(auditLength));
  }
  db.collection("changelog")
    .orderBy("timestamp", "desc")
    .limit(auditLength)
    .get()
    .then((querySnapshot) => {
      const actions: ActionType[] = [];
      const users: string[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.action =
          data.before && data.before.profile ? (data.after && data.after.profile ? "updated" : "deleted") : "created";
        data.changelogId = doc.id;
        actions.push(data as ActionType);
        if (!users.includes(data.user.nickname)) {
          users.push(data.user.nickname);
        }
      });

      alphabeticalSortProp(actions, "timestamp", true);

      dispatch(setUsers(users));

      processActions(actions);

      dispatch(setAllActions(actions));
    })
    .catch((error) => {
      queue.notify({ title: "Error getting data: " + error });
      dispatch(setLoading(false));
    });
};

const processActions = (actions: ActionType[]) => {
  const processedActions: ActionType[] = [...actions].map((action) => {
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

  filterActions(processedActions);
};

export const filterActions = (
  allActionsParam?: ActionType[],
  filterActionParam?: "none" | "created" | "updated" | "deleted",
  filterUserParam?: string
) => {
  const {
    audit: { allActions: allAuditActions, filterAction: auditFilterAction, filterUser: auditFilterUser },
  } = store.getState();
  const allActions = allActionsParam || allAuditActions;
  const filterAction = filterActionParam || auditFilterAction;
  const filterUser = filterUserParam || auditFilterUser;
  let filteredActions = [...allActions];

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
