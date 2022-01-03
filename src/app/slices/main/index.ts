import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";
import type { RootState } from "~/app/store";
import { blankPreset } from "@s/main/constants";
import { partialSet } from "@s/main/constructors";
import { randomInt, removeDuplicates } from "@s/util/functions";
import type { KeysMatching } from "@s/util/types";
import type {
  PresetType,
  SetGroup,
  SetType,
  SortOrderType,
  SortType,
  WhitelistType,
} from "./types";

export const generateRandomSet = (): SetType =>
  partialSet({
    colorway: nanoid(randomInt(5, 14)),
    designer: [...Array(randomInt(1, 3))].map(() => nanoid(randomInt(5, 7))),
    gbEnd: DateTime.now()
      .minus({ days: randomInt(1, 100) })
      .toISODate(),
    gbLaunch: DateTime.now()
      .minus({ days: randomInt(0, 100) })
      .toISODate(),
    icDate: DateTime.now()
      .minus({ days: randomInt(0, 100) })
      .toISODate(),
    id: nanoid(),
    profile: nanoid(randomInt(3, 4)),
  });

export const generateRandomSetGroups = (): SetGroup[] =>
  [...Array(randomInt(2, 8))].map<SetGroup>(() => ({
    sets: [...Array(randomInt(2, 16))].map<SetType>(() => generateRandomSet()),
    title: nanoid(randomInt(8, 14)),
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
  allDesigners: [],
  allProfiles: [],
  allRegions: [],
  allSets: [],
  allVendorRegions: [],
  allVendors: [],
  appPresets: [],
  content: true,
  currentPreset: blankPreset,
  defaultPreset: blankPreset,
  filteredSets: [],
  initialLoad: true,
  linkedFavorites: { array: [], displayName: "" },
  loading: true,
  search: "",
  setGroups: generateRandomSetGroups(),
  sort: "gbLaunch",
  sortOrder: "ascending",
  transition: false,
  urlSet: {
    prop: "id",
    value: "",
  },
  urlWhitelist: {},
  whitelist: {
    bought: false,
    edited: [],
    favorites: false,
    hidden: "unhidden",
    profiles: [],
    regions: [],
    shipped: ["Shipped", "Not shipped"],
    vendorMode: "exclude",
    vendors: [],
  },
};

export const mainSlice = createSlice({
  initialState,
  name: "main",
  reducers: {
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
    setAppPresets: (state, { payload }: PayloadAction<PresetType[]>) => {
      state.appPresets = payload;
    },
    setCurrentPreset: (state, { payload }: PayloadAction<PresetType>) => {
      state.currentPreset = payload;
    },
    setDefaultPreset: (state, { payload }: PayloadAction<PresetType>) => {
      state.defaultPreset = payload;
    },
    setInitialLoad: (state, { payload }: PayloadAction<boolean>) => {
      state.initialLoad = payload;
    },
    setLinkedFavorites: (
      state,
      { payload }: PayloadAction<{ array: string[]; displayName: string }>
    ) => {
      state.linkedFavorites = payload;
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
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setSearch: (state, { payload }: PayloadAction<string>) => {
      state.search = payload;
    },
    setSetGroups: (state, { payload }: PayloadAction<SetGroup[]>) => {
      state.setGroups = payload;
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
    setSort: (state, { payload }: PayloadAction<SortType>) => {
      state.sort = payload;
    },
    setSortOrder: (state, { payload }: PayloadAction<SortOrderType>) => {
      state.sortOrder = payload;
    },
    setTransition: (state, { payload }: PayloadAction<boolean>) => {
      state.transition = payload;
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
    setURLWhitelist: (
      state,
      { payload }: PayloadAction<Partial<WhitelistType>>
    ) => {
      state.urlWhitelist = payload;
    },
    setWhitelist: (state, { payload }: PayloadAction<WhitelistType>) => {
      state.whitelist = { ...payload, edited: Object.keys(payload) };
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
) => setListState({ array, name });

export const setSetList = <P extends Parameters<typeof setSetListState>[0]>(
  name: P["name"],
  array: P["array"]
) => setSetListState({ array, name });

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
