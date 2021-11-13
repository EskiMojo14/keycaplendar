import produce from "immer";
import store from "~/app/store";
import { setFilteredActions, setLoading } from "@s/audit";
import { filterActions } from "@s/audit/functions";
import { ActionType } from "@s/audit/types";

jest.mock("~/app/store");

let dispatchSpy = jest.spyOn(store, "dispatch");

beforeEach(() => {
  dispatchSpy = jest.spyOn(store, "dispatch");
});

afterAll(() => {
  dispatchSpy.mockRestore();
});

describe("filterActions", () => {
  it("filters to specified action type and user", () => {
    const editedState = produce(store.getState(), (draftState) => {
      draftState.audit.allActions = [
        { action: "deleted", user: { nickname: "dvorcol" } },
        { action: "deleted", user: { nickname: "eskimojo" } },
        { action: "created", user: { nickname: "eskimojo" } },
      ] as ActionType[];
      draftState.audit.filterAction = "deleted";
      draftState.audit.filterUser = "eskimojo";
    });
    filterActions(editedState);
    expect(dispatchSpy).toHaveBeenNthCalledWith(
      1,
      setFilteredActions([{ action: "deleted", user: { nickname: "eskimojo" } }] as ActionType[])
    );
    expect(dispatchSpy).toHaveBeenNthCalledWith(2, setLoading(false));
  });
});
