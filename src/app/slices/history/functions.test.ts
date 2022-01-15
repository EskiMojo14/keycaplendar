import produce from "immer";
import store from "~/app/store";
import { setRecentSets, setTab } from "@s/history";
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
    expect(processActions([action])).toEqual([processedAction]);
  });
});

describe("generateSets", () => {
  it("generates recent set entries", () => {
    const modifiedState = produce(store.getState(), (draftState) => {
      draftState.main.allSets = [keyset];
      draftState.history.processedActions = {
        entities: {
          [processedAction.changelogId]: processedAction,
        },
        ids: [processedAction.changelogId],
      };
    });
    generateSets(modifiedState);
    expect(dispatchSpy).toHaveBeenCalledWith(setRecentSets([recentSet]));
  });
});
