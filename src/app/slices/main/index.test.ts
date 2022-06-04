import produce from "immer";
import { createStore } from "~/app/store";
import {
  deleteAppPreset,
  mergeWhitelist,
  selectAllAppPresets,
  selectAppPresetById,
  selectCurrentPresetId,
  selectEditedWhitelist,
  selectLinkedFavorites,
  selectSearch,
  selectSortByPage,
  selectSortOrderByPage,
  selectTransition,
  setAppPresets,
  setCurrentPreset,
  setLinkedFavorites,
  setSearch,
  setSort,
  setSortOrder,
  setTransition,
  upsertAppPreset,
} from "@s/main";
import { partialPreset } from "@s/main/constructors";
import { addAppPreset } from "@s/main/thunks";
import type { SortOrderType, SortType, WhitelistType } from "@s/main/types";
import type { MainPage } from "@s/router/types";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

it("sets transition", () => {
  store.dispatch(setTransition(true));
  const response = selectTransition(store.getState());
  expect(response).toBe(true);
});

const page: MainPage = "timeline";

it("sets sort", () => {
  const sort: SortType = "profile";
  store.dispatch(setSort(page, sort));
  const response = selectSortByPage(store.getState(), page);
  expect(response).toBe(sort);
});

it("sets sort order", () => {
  const sortOrder: SortOrderType = "ascending";
  store.dispatch(setSortOrder(page, sortOrder));
  const response = selectSortOrderByPage(store.getState(), page);
  expect(response).toBe(sortOrder);
});

it("sets search", () => {
  const search = "test";
  store.dispatch(setSearch(search));
  const response = selectSearch(store.getState());
  expect(response).toBe(search);
});

const whitelist: Partial<WhitelistType> = { profiles: ["test"] };

it("sets partial whitelist", () => {
  store.dispatch(mergeWhitelist(whitelist));
  const response = selectEditedWhitelist(store.getState());
  expect(response).toEqual(whitelist);
});

const preset = partialPreset({ name: "Test" });

it("sets current preset", () => {
  store.dispatch(setCurrentPreset(preset.id));
  const response = selectCurrentPresetId(store.getState());
  expect(response).toEqual(preset.id);
});
it("sets app presets", () => {
  store.dispatch(setAppPresets([preset]));
  const response = selectAllAppPresets(store.getState());
  expect(response).toEqual([preset]);
});

it("adds a user preset", () => {
  const newPreset = store.dispatch(addAppPreset(partialPreset({ name: "hi" })));
  const response = selectAppPresetById(store.getState(), newPreset.id);
  expect(response).toEqual(newPreset);
});

it("upserts a user preset", () => {
  const newPreset = store.dispatch(addAppPreset(partialPreset({ name: "hi" })));
  const editedPreset = produce(newPreset, (draft) => {
    draft.name = "bye";
  });
  store.dispatch(upsertAppPreset(editedPreset));
  const response = selectAppPresetById(store.getState(), newPreset.id);
  expect(response).toEqual(editedPreset);
});

it("deletes a user preset", () => {
  const newPreset = store.dispatch(addAppPreset(partialPreset({ name: "hi" })));

  const check = selectAppPresetById(store.getState(), newPreset.id);
  expect(check).toEqual(newPreset);

  store.dispatch(deleteAppPreset(newPreset.id));

  const response = selectAppPresetById(store.getState(), newPreset.id);
  expect(response).toBeUndefined();
});

it("sets linked favourites", () => {
  const val = { array: ["test"], displayName: "string" };
  store.dispatch(setLinkedFavorites(val));
  const response = selectLinkedFavorites(store.getState());
  expect(response).toEqual(val);
});
