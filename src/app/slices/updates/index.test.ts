import { createStore } from "~/app/store";
import {
  selectEntries,
  selectLoading,
  setEntries,
  setLoading,
} from "@s/updates";
import type { UpdateEntryType } from "@s/updates/types";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

const blankEntry: UpdateEntryType = {
  body: "",
  date: "",
  id: "",
  name: "",
  pinned: false,
  title: "",
};

it("sets loading state", () => {
  store.dispatch(setLoading(true));
  const response = selectLoading(store.getState());
  expect(response).toBe(true);
});

it("sets guides array", () => {
  store.dispatch(setEntries([blankEntry]));
  const response = selectEntries(store.getState());
  expect(response).toEqual([blankEntry]);
});
