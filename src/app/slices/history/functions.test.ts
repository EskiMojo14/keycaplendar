import produce from "immer";
import store from "~/app/store";
import {
  setLoading,
  setProcessedActions,
  setRecentSets,
  setTab,
} from "@s/history";
import {
  generateSets,
  processActions,
  setHistoryTab,
} from "@s/history/functions";
import type {
  ProcessedPublicActionType,
  PublicActionType,
  RecentSet,
} from "@s/history/types";
import { partialSet } from "@s/main/constructors";

jest.mock("~/app/store");

let dispatchSpy = jest.spyOn(store, "dispatch");

beforeEach(() => {
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
  documentId: "test",
  timestamp: "test",
  title: "GMK Test",
};

const keyset = partialSet({
  colorway: "test",
  id: "test",
  profile: "GMK",
});

const recentSet: RecentSet = {
  currentSet: keyset,
  deleted: false,
  designer: [],
  id: "test",
  latestTimestamp: "test",
  title: "GMK Test",
};

describe("setHistoryTab", () => {
  it("dispatches action to state", () => {
    setHistoryTab(tab, false);
    expect(dispatchSpy).toHaveBeenCalledWith(setTab(tab));
  });
  it("doesn't dispatch action if tab is same as in state", () => {
    const modifiedState = produce(store.getState(), (draftState) => {
      draftState.history.tab = tab;
    });
    setHistoryTab(tab, false, modifiedState);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});

describe("processActions", () => {
  it("processes actions and dispatches to state", () => {
    processActions([action]);
    expect(dispatchSpy).toHaveBeenNthCalledWith(
      1,
      setProcessedActions([processedAction])
    );
    expect(dispatchSpy).toHaveBeenNthCalledWith(2, setLoading(false));
  });
});

describe("generateSets", () => {
  it("generates recent set entries", () => {
    const modifiedState = produce(store.getState(), (draftState) => {
      draftState.main.allSets = [keyset];
      draftState.history.processedActions = [processedAction];
    });
    generateSets(modifiedState);
    expect(dispatchSpy).toHaveBeenCalledWith(setRecentSets([recentSet]));
  });
});
