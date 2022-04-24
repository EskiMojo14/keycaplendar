import isEqual from "lodash.isequal";
import { is } from "typescript-is";
import { notify } from "~/app/snackbar-queue";
import type { AppThunk } from "~/app/store";
import { auditProperties } from "@s/audit/constants";
import firebase from "@s/firebase";
import { setLoading, setProcessedActions } from ".";
import type { ProcessedPublicActionType, PublicActionType } from "./types";

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
    notify({ title: `Failed to get changelog: ${error}` });
  }
};
