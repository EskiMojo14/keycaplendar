import { createStore } from "~/app/store";
import {
  selectAllUsers,
  selectIndices,
  selectLoading,
  selectNextPageToken,
  selectPage,
  selectPaginatedUsers,
  selectReverseSort,
  selectRowsPerPage,
  selectSort,
  selectSortedUsers,
  selectView,
  setAllUsers,
  setIndices,
  setLoading,
  setNextPageToken,
  setPage,
  setPaginatedUsers,
  setReverseSort,
  setRowsPerPage,
  setSort,
  setSortedUsers,
  setView,
} from "@s/users";
import type { sortProps } from "@s/users/constants";
import { partialUser } from "@s/users/constructors";
import type { UserType } from "@s/users/types";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

it("sets view", () => {
  const view = "card";
  store.dispatch(setView(view));
  const response = selectView(store.getState());
  expect(response).toBe(view);
});

it("sets loading", () => {
  store.dispatch(setLoading(true));
  const response = selectLoading(store.getState());
  expect(response).toBe(true);
});

it("sets sort", () => {
  const sort: typeof sortProps[number] = "nickname";
  store.dispatch(setSort(sort));
  const response = selectSort(store.getState());
  expect(response).toBe(sort);
});

it("sets reverse sort", () => {
  store.dispatch(setReverseSort(true));
  const response = selectReverseSort(store.getState());
  expect(response).toBe(true);
});

const userArray: UserType[] = [partialUser({ email: "test" })];

it("sets all users", () => {
  store.dispatch(setAllUsers(userArray));
  const response = selectAllUsers(store.getState());
  expect(response).toEqual(userArray);
});

it("sets sorted users", () => {
  store.dispatch(setSortedUsers(userArray));
  const response = selectSortedUsers(store.getState());
  expect(response).toEqual(userArray);
});

it("sets paginated users", () => {
  store.dispatch(setPaginatedUsers(userArray));
  const response = selectPaginatedUsers(store.getState());
  expect(response).toEqual(userArray);
});

it("sets next page token", () => {
  const token = "test";
  store.dispatch(setNextPageToken(token));
  const response = selectNextPageToken(store.getState());
  expect(response).toBe(token);
});

it("sets rows per page", () => {
  const rows = 50;
  store.dispatch(setRowsPerPage(rows));
  const response = selectRowsPerPage(store.getState());
  expect(response).toBe(rows);
});

it("sets page number", () => {
  const page = 20;
  store.dispatch(setPage(page));
  const response = selectPage(store.getState());
  expect(response).toBe(page);
});

it("sets indices", () => {
  const payload = { first: 20, last: 40 };
  store.dispatch(setIndices(payload));
  const response = selectIndices(store.getState());
  expect(response).toEqual(payload);
});
