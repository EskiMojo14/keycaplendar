import { SetType } from "../main/types";

/** SetType but with all keys set to optional, as an action can include "deleted" sets. */
export type ActionSetType = Partial<SetType>;

export type ActionType = {
  action: "created" | "deleted" | "updated";
  after: ActionSetType;
  before: ActionSetType;
  documentId: string;
  timestamp: string;
  user: {
    displayName: string;
    email: string;
    nickname?: string;
  };
};

export type PublicActionType = {
  action: "created" | "deleted" | "updated";
  after: ActionSetType;
  before: ActionSetType;
  changelogId: string;
  documentId: string;
  timestamp: string;
};
