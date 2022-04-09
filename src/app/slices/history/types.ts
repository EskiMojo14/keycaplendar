import type { ActionSetType } from "@s/audit/types";
import type { historyTabs } from "./constants";

export type HistoryTab = typeof historyTabs[number];

export type PublicActionType = {
  action: "created" | "deleted" | "updated";
  after: ActionSetType;
  before: ActionSetType;
  changelogId: string;
  documentId: string;
  timestamp: string;
};

export type ProcessedPublicActionType = PublicActionType & {
  title: string;
};

export type RecentSet = {
  deleted: boolean;
  designer: string[] | undefined;
  id: string;
  latestTimestamp: string;
  title: string;
};
