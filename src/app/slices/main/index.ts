import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";
import type { RootState } from "~/app/store";
import { randomInt, removeDuplicates } from "@s/util/functions";
import type { KeysMatching } from "@s/util/types";
import { Keyset, Preset } from "./constructors";
import type {
  PresetType,
  SetGroup,
  SetType,
  SortOrderType,
  SortType,
  WhitelistType,
} from "./types";

export const generateRandomSet = (): SetType => ({
  ...new Keyset(
    nanoid(randomInt(3, 4)),
    nanoid(randomInt(5, 14)),
    [...Array(randomInt(1, 3))].map(() => nanoid(randomInt(5, 7))),
    "",
    DateTime.now()
      .minus({ days: randomInt(0, 100) })
      .toISODate(),
    DateTime.now()
      .minus({ days: randomInt(0, 100) })
      .toISODate(),
    DateTime.now()
      .minus({ days: randomInt(1, 100) })
      .toISODate()
  ),
  id: nanoid(),
});

export const generateRandomSetGroups = (): SetGroup[] =>
  [...Array(randomInt(2, 8))].map<SetGroup>(() => ({
    title: nanoid(randomInt(8, 14)),
    sets: [...Array(randomInt(2, 16))].map<SetType>(() => generateRandomSet()),
  }));

export type MainState = {
  allDesigners: string[];
  allProfiles: string[];
  allRegions: string[];
  allSets: SetType[];
  allVendorRegions: string[];
  allVendors: string[];
  appPresets: PresetType[];
  content: boolean;
  currentPreset: PresetType;
  defaultPreset: PresetType;
  filteredSets: SetType[];
  initialLoad: boolean;
  linkedFavorites: { array: string[]; displayName: string };
  loading: boolean;
  search: string;
  setGroups: SetGroup[];
  sort: SortType;
  sortOrder: SortOrderType;
  transition: boolean;
  urlSet: {
    prop: "alias" | "id" | "name";
    value: string;
  };
  urlWhitelist: Partial<WhitelistType>;
  whitelist: WhitelistType;
};

export const initialState: MainState = {
  // state
  transition: false,
  initialLoad: true,
  loading: true,
  content: true,

  // sorts
  sort: "gbLaunch",
  sortOrder: "ascending",

  // lists
  allDesigners: [],
  allProfiles: [],
  allRegions: [],
  allVendors: [],
  allVendorRegions: [],

  // sets
  allSets: [],
  filteredSets: [],
  setGroups: generateRandomSetGroups(),
  urlSet: {
    prop: "id",
    value: "",
  },

  // filters

  search: "",
  whitelist: {
    edited: [],
    favorites: false,
    bought: false,
    hidden: "unhidden",
    profiles: [],
    shipped: ["Shipped", "Not shipped"],
    regions: [],
    vendorMode: "exclude",
    vendors: [],
  },
  urlWhitelist: {},
  currentPreset: { ...new Preset() },
  defaultPreset: { ...new Preset() },
  appPresets: [],

  linkedFavorites: { array: [], displayName: "" },
};

export const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    setTransition: (state, { payload }: PayloadAction<boolean>) => {
      state.transition = payload;
    },
    setInitialLoad: (state, { payload }: PayloadAction<boolean>) => {
      state.initialLoad = payload;
    },
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setSort: (state, { payload }: PayloadAction<SortType>) => {
      state.sort = payload;
    },
    setSortOrder: (state, { payload }: PayloadAction<SortOrderType>) => {
      state.sortOrder = payload;
    },
    setListState: (
      state,
      {
        payload: { array, name },
      }: PayloadAction<{
        array: string[];
        name: KeysMatching<MainState, string[]>;
      }>
    ) => {
      state[name] = array;
    },
    setSetListState: (
      state,
      {
        payload: { array, name },
      }: PayloadAction<{
        array: SetType[];
        name: KeysMatching<MainState, SetType[]>;
      }>
    ) => {
      state[name] = array;
    },
    setSetGroups: (state, { payload }: PayloadAction<SetGroup[]>) => {
      state.setGroups = payload;
    },
    setURLSetState: (
      state,
      {
        payload,
      }: PayloadAction<{
        prop: "alias" | "id" | "name";
        value: string;
      }>
    ) => {
      state.urlSet = payload;
    },
    setSearch: (state, { payload }: PayloadAction<string>) => {
      state.search = payload;
    },
    setWhitelist: (state, { payload }: PayloadAction<WhitelistType>) => {
      state.whitelist = { ...payload, edited: Object.keys(payload) };
    },
    mergeWhitelist: (
      state,
      { payload }: PayloadAction<Partial<WhitelistType>>
    ) => {
      const edited = removeDuplicates([
        ...(state.whitelist.edited ?? []),
        ...Object.keys(payload),
      ]);
      state.whitelist = { ...state.whitelist, ...payload, edited };
    },
    setURLWhitelist: (
      state,
      { payload }: PayloadAction<Partial<WhitelistType>>
    ) => {
      state.urlWhitelist = payload;
    },
    setCurrentPreset: (state, { payload }: PayloadAction<PresetType>) => {
      state.currentPreset = payload;
    },
    setDefaultPreset: (state, { payload }: PayloadAction<PresetType>) => {
      state.defaultPreset = payload;
    },
    setAppPresets: (state, { payload }: PayloadAction<PresetType[]>) => {
      state.appPresets = payload;
    },
    setLinkedFavorites: (
      state,
      { payload }: PayloadAction<{ array: string[]; displayName: string }>
    ) => {
      state.linkedFavorites = payload;
    },
  },
});

export const {
  actions: {
    mergeWhitelist,
    setAppPresets,
    setCurrentPreset,
    setDefaultPreset,
    setInitialLoad,
    setLinkedFavorites,
    setListState,
    setLoading,
    setSearch,
    setSetGroups,
    setSetListState,
    setSort,
    setSortOrder,
    setTransition,
    setURLSetState,
    setURLWhitelist,
    setWhitelist,
  },
} = mainSlice;

export const setList = <P extends Parameters<typeof setListState>[0]>(
  name: P["name"],
  array: P["array"]
) => setListState({ name, array });

export const setSetList = <P extends Parameters<typeof setSetListState>[0]>(
  name: P["name"],
  array: P["array"]
) => setSetListState({ name, array });

export const setURLSet = <P extends Parameters<typeof setURLSetState>[0]>(
  prop: P["prop"],
  value: P["value"]
) => setURLSetState({ prop, value });

export const selectTransition = (state: RootState) => state.main.transition;

export const selectLoading = (state: RootState) => state.main.loading;

export const selectInitialLoad = (state: RootState) => state.main.initialLoad;

export const selectContent = (state: RootState) => state.main.content;

export const selectSort = (state: RootState) => state.main.sort;

export const selectSortOrder = (state: RootState) => state.main.sortOrder;

export const selectAllDesigners = (state: RootState) => state.main.allDesigners;

export const selectAllProfiles = (state: RootState) => state.main.allProfiles;

export const selectAllRegions = (state: RootState) => state.main.allRegions;

export const selectAllVendors = (state: RootState) => state.main.allVendors;

export const selectAllVendorRegions = (state: RootState) =>
  state.main.allVendorRegions;

export const selectAllSets = (state: RootState) => state.main.allSets;

export const selectFilteredSets = (state: RootState) => state.main.filteredSets;

export const selectSetGroups = (state: RootState) => state.main.setGroups;

export const selectURLSet = (state: RootState) => state.main.urlSet;

export const selectSearch = (state: RootState) => state.main.search;

export const selectWhitelist = (state: RootState) => state.main.whitelist;

export const selectCurrentPreset = (state: RootState) =>
  state.main.currentPreset;

export const selectDefaultPreset = (state: RootState) =>
  state.main.defaultPreset;

export const selectAppPresets = (state: RootState) => state.main.appPresets;

export const selectLinkedFavorites = (state: RootState) =>
  state.main.linkedFavorites;

export const selectURLWhitelist = (state: RootState) => state.main.urlWhitelist;

export default mainSlice.reducer;
