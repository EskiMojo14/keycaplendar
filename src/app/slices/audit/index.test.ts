import { createStore } from "~/app/store";
import {
  filterAction,
  filterUser,
  lengthChange,
  selectFilterAction,
  selectFilterUser,
  selectLength,
} from "@s/audit";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

it("sets filter action type", () => {
  const action = "created";
  store.dispatch(filterAction(action));
  const response = selectFilterAction(store.getState());
  expect(response).toBe(action);
});

it("sets filter user type", () => {
  const user = "eskimojo";
  store.dispatch(filterUser(user));
  const response = selectFilterUser(store.getState());
  expect(response).toBe(user);
});

it("sets audit log length", () => {
  const length = 100;
  store.dispatch(lengthChange(length));
  const response = selectLength(store.getState());
  expect(response).toBe(length);
});
