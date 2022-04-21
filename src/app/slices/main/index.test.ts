import produce from "immer";
import { createStore } from "~/app/store";
import type { MainPage } from "@s/common/types";
import {
  deleteAppPreset,
  deleteSet,
  initialState,
  mergeWhitelist,
  selectAllAppPresets,
  selectAllSets,
  selectAppPresetById,
  selectCurrentPresetId,
  selectLinkedFavorites,
  selectLoading,
  selectSearch,
  selectSetById,
  selectSortByPage,
  selectSortOrderByPage,
  selectTransition,
  selectURLSet,
  selectURLWhitelist,
  selectWhitelist,
  setAllSets,
  setAppPresets,
  setCurrentPreset,
  setLinkedFavorites,
  setLoading,
  setSearch,
  setSet,
  setSort,
  setSortOrder,
  setTransition,
  setURLSet,
  setURLWhitelist,
  upsertAppPreset,
} from "@s/main";
import { blankKeyset } from "@s/main/constants";
import { partialPreset } from "@s/main/constructors";
import { addAppPreset } from "@s/main/thunks";
import type {
  SetType,
  SortOrderType,
  SortType,
  WhitelistType,
} from "@s/main/types";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

it("sets transition", () => {
  store.dispatch(setTransition(true));
  const response = selectTransition(store.getState());
  expect(response).toBe(true);
});

it("sets loading", () => {
  store.dispatch(setLoading(true));
  const response = selectLoading(store.getState());
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

it("sets all sets", () => {
  const list: SetType[] = [blankKeyset];
  store.dispatch(setAllSets(list));
  const response = selectAllSets(store.getState());
  expect(response).toEqual(list);
});

it("sets a set", () => {
  store.dispatch(setSet(blankKeyset));
  const response = selectSetById(store.getState(), blankKeyset.id);
  expect(response).toEqual(blankKeyset);
});

it("deletes a set", () => {
  store.dispatch(setSet(blankKeyset));
  const check = selectSetById(store.getState(), blankKeyset.id);
  expect(check).toEqual(blankKeyset);
  store.dispatch(deleteSet(blankKeyset.id));
  const response = selectSetById(store.getState(), blankKeyset.id);
  expect(response).toBeUndefined();
});

it("sets URL set", () => {
  const val = { prop: "id", value: "test" } as const;
  store.dispatch(setURLSet(val.prop, val.value));
  const response = selectURLSet(store.getState());
  expect(response).toEqual(val);
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
  const response = selectWhitelist(store.getState());
  const expected = {
    ...initialState.whitelist,
    ...whitelist,
    edited: Object.keys(whitelist),
  };
  expect(response).toEqual(expected);
});

it("sets URL whitelist", () => {
  store.dispatch(setURLWhitelist(whitelist));
  const response = selectURLWhitelist(store.getState());
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
