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
import type { HistoryTab, ProcessedPublicActionType, RecentSet } from "@s/history/types";
import { Keyset } from "@s/main/constructors";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

const action: ProcessedPublicActionType = {
  action: "created",
  before: {},
  after: {},
  timestamp: "",
  documentId: "",
  title: "",
};

const recentSet: RecentSet = {
  title: "",
  latestTimestamp: "",
  id: "",
  deleted: false,
  designer: [],
  currentSet: { ...new Keyset() },
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
