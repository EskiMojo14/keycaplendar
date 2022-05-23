import { createStore } from "~/app/store";
import {
  pageChange,
  rowsPerPageChange,
  selectPage,
  selectRowsPerPage,
  selectSort,
  selectView,
  sortChange,
  viewChange,
} from "@s/users";
import type { sortProps } from "@s/users/constants";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

it("sets page number", () => {
  const page = 20;
  store.dispatch(pageChange(page));
  const response = selectPage(store.getState());
  expect(response).toBe(page);
});

it("sets rows per page", () => {
  const rows = 50;
  store.dispatch(rowsPerPageChange(rows));
  const response = selectRowsPerPage(store.getState());
  expect(response).toBe(rows);
});

it("sets sort", () => {
  const sort: typeof sortProps[number] = "nickname";
  store.dispatch(sortChange(sort));
  const response = selectSort(store.getState());
  expect(response).toBe(sort);
});

it("sets view", () => {
  const view = "card";
  store.dispatch(viewChange(view));
  const response = selectView(store.getState());
  expect(response).toBe(view);
});
