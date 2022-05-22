import { createStore } from "~/app/store";
import {
  selectPage,
  selectRowsPerPage,
  selectSort,
  selectView,
  setPage,
  setRowsPerPage,
  setSort,
  setView,
} from "@s/users";
import type { sortProps } from "@s/users/constants";

let store = createStore();

beforeEach(() => {
  store = createStore();
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
