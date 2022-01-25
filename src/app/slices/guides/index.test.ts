import { createStore } from "~/app/store";
import {
  selectAllTags,
  selectEntries,
  selectFilteredTag,
  selectLoading,
  selectURLEntry,
  selectVisibilityMap,
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

const string = "tag";

const blankEntry: GuideEntryType = {
  body: "",
  description: "",
  id: "test",
  name: "",
  tags: [string],
  title: "",
  visibility: "all",
};

it("sets loading state", () => {
  store.dispatch(setLoading(true));
  const response = selectLoading(store.getState());
  expect(response).toBe(true);
});

it("sets guides array, tags, and visibility map", () => {
  store.dispatch(setEntries([blankEntry]));
  const guides = selectEntries(store.getState());
  expect(guides).toEqual([blankEntry]);
  const tags = selectAllTags(store.getState());
  expect(tags).toEqual([string]);
  const visibilityMap = selectVisibilityMap(store.getState());
  const expectedVisibilityMap = {
    admin: [],
    all: [blankEntry.id],
    designer: [],
    editor: [],
  };
  expect(visibilityMap).toEqual(expectedVisibilityMap);
});

it("sets URL entry ID", () => {
  store.dispatch(setURLEntry(string));
  const response = selectURLEntry(store.getState());
  expect(response).toBe(string);
});

it("sets filtered tag", () => {
  store.dispatch(setFilteredTag(string));
  const response = selectFilteredTag(store.getState());
  expect(response).toBe(string);
});
