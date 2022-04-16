import isEqual from "lodash.isequal";
import { queue } from "~/app/snackbar-queue";
import type { AppThunk } from "~/app/store";
import firestore from "@s/firebase/firestore";
import { alphabeticalSortProp } from "@s/util/functions";
import { selectLength, setAllActions, setLoading } from ".";
import { auditProperties } from "./constants";
import type { ActionType } from "./types";

const processAction = ({
  after,
  before,
  ...restAction
}: ActionType): ActionType => {
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
};

export const getActions =
  (length?: number): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      const querySnapshot = await firestore
        .collection("changelog")
        .orderBy("timestamp", "desc")
        .limit(length ?? selectLength(getState()))
        .get();

      const actions: ActionType[] = [];
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
      });

      alphabeticalSortProp(actions, "timestamp", true);

      dispatch([setAllActions(actions.map(processAction)), setLoading(false)]);
    } catch (error) {
      queue.notify({ title: `Error getting data: ${error}` });
      dispatch(setLoading(false));
    }
  };
