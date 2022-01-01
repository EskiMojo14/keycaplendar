import { createStore } from "~/app/store";
import {
  selectAllTags,
  selectEntries,
  selectFilteredTag,
  selectLoading,
  selectURLEntry,
  setAllTags,
  setEntries,
  setFilteredTag,
  setLoading,
  setURLEntry,
} from "@s/guides";
import type { GuideEntryType } from "@s/guides/types";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

const blankEntry: GuideEntryType = {
  body: "",
  description: "",
  id: "",
  name: "",
  tags: [],
  title: "",
  visibility: "all",
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

it("sets tags array", () => {
  store.dispatch(setAllTags([string]));
  const response = selectAllTags(store.getState());
  expect(response).toEqual([string]);
});

it("sets filtered tag", () => {
  store.dispatch(setFilteredTag(string));
  const response = selectFilteredTag(store.getState());
  expect(response).toBe(string);
});
