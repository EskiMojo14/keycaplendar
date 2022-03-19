import { createStore } from "~/app/store";
import {
  selectLoading,
  selectProcessedActions,
  selectRecentSets,
  selectTab,
  setLoading,
  setProcessedActions,
  setRecentSets,
  setTab,
} from "@s/history";
import type {
  HistoryTab,
  ProcessedPublicActionType,
  RecentSet,
} from "@s/history/types";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

const action: ProcessedPublicActionType = {
  action: "created",
  after: {},
  before: {},
  changelogId: "",
  documentId: "",
  timestamp: "",
  title: "",
};

const recentSet: RecentSet = {
  deleted: false,
  designer: [],
  id: "",
  latestTimestamp: "",
  title: "",
};

it("sets loading state", () => {
  store.dispatch(setLoading(true));
  const response = selectLoading(store.getState());
  expect(response).toBe(true);
});

it("sets current tab", () => {
  const tab: HistoryTab = "changelog";
  store.dispatch(setTab(tab));
  const response = selectTab(store.getState());
  expect(response).toBe(tab);
});

it("sets processed actions array", () => {
  store.dispatch(setProcessedActions([action]));
  const response = selectProcessedActions(store.getState());
  expect(response).toEqual([action]);
});

it("sets recent sets array", () => {
  store.dispatch(setRecentSets([recentSet]));
  const response = selectRecentSets(store.getState());
  expect(response).toEqual([recentSet]);
});
