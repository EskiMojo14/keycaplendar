import { createStore } from "~/app/store";
import {
  appendUsers,
  selectLoading,
  selectNextPageToken,
  selectPage,
  selectRowsPerPage,
  selectSort,
  selectUsers,
  selectView,
  setLoading,
  setNextPageToken,
  setPage,
  setRowsPerPage,
  setSort,
  setUsers,
  setView,
} from "@s/users";
import type { sortProps } from "@s/users/constants";
import { partialUser } from "@s/users/constructors";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

it("sets loading", () => {
  store.dispatch(setLoading(true));
  const response = selectLoading(store.getState());
  expect(response).toBe(true);
});

it("sets next page token", () => {
  const token = "test";
  store.dispatch(setNextPageToken(token));
  const response = selectNextPageToken(store.getState());
  expect(response).toBe(token);
});

it("sets page number", () => {
  const page = 20;
  store.dispatch(setPage(page));
  const response = selectPage(store.getState());
  expect(response).toBe(page);
});

it("sets rows per page", () => {
  const rows = 50;
  store.dispatch(setRowsPerPage(rows));
  const response = selectRowsPerPage(store.getState());
  expect(response).toBe(rows);
});

it("sets sort", () => {
  const sort: typeof sortProps[number] = "nickname";
  store.dispatch(setSort(sort));
  const response = selectSort(store.getState());
  expect(response).toBe(sort);
});

it("sets view", () => {
  const view = "card";
  store.dispatch(setView(view));
  const response = selectView(store.getState());
  expect(response).toBe(view);
});

const userArray = [partialUser({ id: "test" })];

it("sets users", () => {
  store.dispatch(setUsers(userArray));
  const response = selectUsers(store.getState());
  expect(response).toEqual(userArray);
});

it("appends users", () => {
  const userArray2 = [partialUser({ id: "test2" })];
  store.dispatch(setUsers(userArray));
  store.dispatch(appendUsers(userArray2));
  const response = selectUsers(store.getState());
  expect(response).toEqual([...userArray, ...userArray2]);
});
