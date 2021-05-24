import { SetType } from "../main/types";

/** SetType but with all keys set to optional, as an action can include "deleted" sets. */
export type ActionSetType = Omit<Partial<SetType>, "id">;

export type ActionType = {
  action: "created" | "deleted" | "updated";
  after: ActionSetType;
  before: ActionSetType;
  changelogId: string;
  documentId: string;
  timestamp: string;
  user: {
    displayName: string;
    email: string;
    nickname?: string;
  };
};
