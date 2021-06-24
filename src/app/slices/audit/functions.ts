import isEqual from "lodash.isequal";
import { queue } from "~/app/snackbarQueue";
import store from "~/app/store";
import { setAllActions, setFilteredActions, setLength, setLoading, setUsers } from "./auditSlice";
import { auditProperties } from "./constants";
import { ActionType } from "./types";
import { alphabeticalSortProp } from "@s/common/functions";
import { typedFirestore } from "@s/firebase/firestore";

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
  typedFirestore
    .collection("changelog")
    .orderBy("timestamp", "desc")
    .limit(auditLength)
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
