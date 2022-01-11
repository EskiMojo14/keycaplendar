import { createStore } from "~/app/store";
import {
  selectActions,
  selectFilterAction,
  selectFilterUser,
  selectLength,
  selectLoading,
  selectUsers,
  setAllActions,
  setFilterAction,
  setFilterUser,
  setLength,
  setLoading,
  setUsers,
} from "@s/audit";
import type { ActionType } from "@s/audit/types";

const blankAction: ActionType = {
  action: "created",
  after: {},
  before: {},
  changelogId: "",
  documentId: "",
  timestamp: "",
  user: {
    displayName: "",
    email: "",
  },
};

let store = createStore();

beforeEach(() => {
  store = createStore();
});

it("sets loading state", () => {
  store.dispatch(setLoading(true));
  const response = selectLoading(store.getState());
  expect(response).toBe(true);
});

it("sets all actions array", () => {
  store.dispatch(setAllActions([blankAction]));
  const response = selectActions(store.getState());
  expect(response).toEqual([blankAction]);
});

it("sets filter action type", () => {
  const action = "created";
  store.dispatch(setFilterAction(action));
  const response = selectFilterAction(store.getState());
  expect(response).toBe(action);
});

it("sets filter user type", () => {
  const user = "eskimojo";
  store.dispatch(setFilterUser(user));
  const response = selectFilterUser(store.getState());
  expect(response).toBe(user);
});

it("sets audit log length", () => {
  const length = 100;
  store.dispatch(setLength(length));
  const response = selectLength(store.getState());
  expect(response).toBe(length);
});

it("sets user list", () => {
  const users = ["eskimojo", "dvorcol"];
  store.dispatch(setUsers(users));
  const response = selectUsers(store.getState());
  expect(response).toEqual(users);
});
