import { createStore } from "~/app/store";
import { selectEntries, selectLoading, selectURLEntry, setEntries, setLoading, setURLEntry } from "@s/updates";
import type { UpdateEntryType } from "@s/updates/types";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

const blankEntry: UpdateEntryType = {
  id: "",
  name: "",
  title: "",
  body: "",
  date: "",
  pinned: false,
};

const string = "test";

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

it("sets URL entry ID", () => {
  store.dispatch(setURLEntry(string));
  const response = selectURLEntry(store.getState());
  expect(response).toBe(string);
});
