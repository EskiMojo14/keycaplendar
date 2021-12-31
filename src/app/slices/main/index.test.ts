import { createStore } from "~/app/store";
import {
  initialState,
  mergeWhitelist,
  selectAllDesigners,
  selectAllSets,
  selectAppPresets,
  selectCurrentPreset,
  selectDefaultPreset,
  selectLinkedFavorites,
  selectLoading,
  selectSearch,
  selectSetGroups,
  selectSort,
  selectSortOrder,
  selectTransition,
  selectURLSet,
  selectURLWhitelist,
  selectWhitelist,
  setAppPresets,
  setCurrentPreset,
  setDefaultPreset,
  setLinkedFavorites,
  setList,
  setLoading,
  setSearch,
  setSetGroups,
  setSetList,
  setSort,
  setSortOrder,
  setTransition,
  setURLSet,
  setURLWhitelist,
  setWhitelist,
} from "@s/main";
import { Keyset, Preset, Whitelist } from "@s/main/constructors";
import type {
  PresetType,
  SetGroup,
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

it("sets sort", () => {
  const sort: SortType = "profile";
  store.dispatch(setSort(sort));
  const response = selectSort(store.getState());
  expect(response).toBe(sort);
});

it("sets sort order", () => {
  const sortOrder: SortOrderType = "ascending";
  store.dispatch(setSortOrder(sortOrder));
  const response = selectSortOrder(store.getState());
  expect(response).toBe(sortOrder);
});

it("sets specified list", () => {
  const list = ["test"];
  store.dispatch(setList("allDesigners", list));
  const response = selectAllDesigners(store.getState());
  expect(response).toEqual(list);
});

it("sets specified set list", () => {
  const list: SetType[] = [new Keyset("test")];
  store.dispatch(setSetList("allSets", list));
  const response = selectAllSets(store.getState());
  expect(response).toEqual(list);
});

it("sets set groups", () => {
  const groups: SetGroup[] = [{ title: "test", sets: [new Keyset("test")] }];
  store.dispatch(setSetGroups(groups));
  const response = selectSetGroups(store.getState());
  expect(response).toEqual(groups);
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

it("sets whitelist", () => {
  const whitelist: WhitelistType = { ...new Whitelist(true, true) };
  store.dispatch(setWhitelist(whitelist));
  const response = selectWhitelist(store.getState());
  expect(response).toEqual({ ...whitelist, edited: Object.keys(whitelist) });
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

const preset: PresetType = { ...new Preset("test") };

it("sets current preset", () => {
  store.dispatch(setCurrentPreset(preset));
  const response = selectCurrentPreset(store.getState());
  expect(response).toEqual(preset);
});

it("sets default preset", () => {
  store.dispatch(setDefaultPreset(preset));
  const response = selectDefaultPreset(store.getState());
  expect(response).toEqual(preset);
});

it("sets app presets", () => {
  store.dispatch(setAppPresets([preset]));
  const response = selectAppPresets(store.getState());
  expect(response).toEqual([preset]);
});

it("sets linked favourites", () => {
  const val = { array: ["test"], displayName: "string" };
  store.dispatch(setLinkedFavorites(val));
  const response = selectLinkedFavorites(store.getState());
  expect(response).toEqual(val);
});
