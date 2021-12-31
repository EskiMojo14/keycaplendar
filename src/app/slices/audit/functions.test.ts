import produce from "immer";
import store from "~/app/store";
import { setFilteredActions, setLoading } from "@s/audit";
import { filterActions } from "@s/audit/functions";
import type { ActionType } from "@s/audit/types";

jest.mock("~/app/store");

let dispatchSpy = jest.spyOn(store, "dispatch");

beforeEach(() => {
  dispatchSpy = jest.spyOn(store, "dispatch");
});

afterAll(() => {
  dispatchSpy.mockRestore();
});

const createExampleAction = (
  action: ActionType["action"],
  nickname: ActionType["user"]["nickname"]
): ActionType => ({
  action,
  changelogId: "",
  documentId: "",
  timestamp: "",
  user: {
    nickname,
    displayName: "",
    email: "",
  },
  before: {},
  after: {},
});

describe("filterActions", () => {
  it("filters to specified action type and user", () => {
    const editedState = produce(store.getState(), (draftState) => {
      draftState.audit.allActions = [
        createExampleAction("deleted", "dvorcol"),
        createExampleAction("deleted", "eskimojo"),
        createExampleAction("created", "eskimojo"),
      ];
      draftState.audit.filterAction = "deleted";
      draftState.audit.filterUser = "eskimojo";
    });
    filterActions(editedState);
    expect(dispatchSpy).toHaveBeenNthCalledWith(
      1,
      setFilteredActions([createExampleAction("deleted", "eskimojo")])
    );
    expect(dispatchSpy).toHaveBeenNthCalledWith(2, setLoading(false));
  });
});
