import { ActionSetType } from "../audit/types";
import { SetType } from "../main/types";

export type PublicActionType = {
  action: "created" | "deleted" | "updated";
  after: ActionSetType;
  before: ActionSetType;
  documentId: string;
  timestamp: string;
};

export type ProcessedPublicActionType = PublicActionType & {
  title: string;
};

export type RecentSet = {
  id: string;
  title: string;
  designer: string[] | null;
  deleted: boolean;
  currentSet: SetType | null;
  latestTimestamp: string;
};
