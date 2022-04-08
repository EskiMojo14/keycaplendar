import type { AuditState } from ".";
import type { ActionType } from "./types";

export const filterActions = (
  actions: ActionType[],
  { action: filterAction, user: filterUser }: AuditState["filter"]
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
