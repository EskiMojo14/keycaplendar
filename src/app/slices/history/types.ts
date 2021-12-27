import { ActionSetType } from "@s/audit/types";
import { SetType } from "@s/main/types";
import { historyTabs } from "./constants";

export type HistoryTab = typeof historyTabs[number];

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
