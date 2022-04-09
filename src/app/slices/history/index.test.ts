import { createStore } from "~/app/store";
import {
  processAction,
  selectLoading,
  selectProcessedActions,
  selectTab,
  setHistoryTab,
  setLoading,
  setProcessedActions,
  setTab,
} from "@s/history";
import type {
  HistoryTab,
  ProcessedPublicActionType,
  PublicActionType,
} from "@s/history/types";

let store = createStore();

let dispatchSpy = jest.spyOn(store, "dispatch");

beforeEach(() => {
  store = createStore();
  dispatchSpy = jest.spyOn(store, "dispatch");
});

afterAll(() => {
  dispatchSpy.mockRestore();
});

const tab = "changelog";

const action: PublicActionType = {
  action: "updated",
  after: {
    colorway: "Test",
    details: "test2",
    icDate: "2021-04-02",
    profile: "GMK",
  },
  before: {
    colorway: "Test",
    details: "test",
    icDate: "2021-04-02",
    profile: "GMK",
  },
  changelogId: "test2",
  documentId: "test",
  timestamp: "test",
};

const processedAction: ProcessedPublicActionType = {
  action: "updated",
  after: {
    details: "test2",
  },
  before: {
    details: "test",
  },
  changelogId: "test2",
  documentId: "test",
  timestamp: "test",
  title: "GMK Test",
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
  store.dispatch(setProcessedActions([processedAction]));
  const response = selectProcessedActions(store.getState());
  expect(response).toEqual([processedAction]);
});

describe("setHistoryTab", () => {
  it("dispatches action to state", () => {
    setHistoryTab(tab, false)(store.dispatch, store.getState);
    expect(dispatchSpy).toHaveBeenCalledWith(setTab(tab));
  });
  it("doesn't dispatch action if tab is same as in state", () => {
    setHistoryTab(selectTab(store.getState()), false)(
      store.dispatch,
      store.getState
    );
    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});

describe("processAction", () => {
  it("processes action", () => {
    expect(processAction(action)).toEqual(processedAction);
  });
});
