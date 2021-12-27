import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { removeDuplicates } from "@s/util/functions";
import { Preset } from "./constructors";
import { PresetType, SetGroup, SetType, SortOrderType, SortType, WhitelistType } from "./types";
import { KeysMatching } from "@s/util/types";

export type MainState = {
  transition: boolean;
  loading: boolean;
  content: boolean;

  sort: SortType;
  sortOrder: SortOrderType;

  allDesigners: string[];
  allProfiles: string[];
  allRegions: string[];
  allVendors: string[];
  allVendorRegions: string[];

  allSets: SetType[];
  filteredSets: SetType[];
  setGroups: SetGroup[];
  urlSet: {
    prop: "id" | "alias" | "name";
    value: string;
  };

  search: string;
  whitelist: WhitelistType;
  urlWhitelist: Partial<WhitelistType>;
  currentPreset: PresetType;
  defaultPreset: PresetType;
  appPresets: PresetType[];

  linkedFavorites: { array: string[]; displayName: string };
};

export const initialState: MainState = {
  // state
  transition: false,
  loading: false,
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
  setGroups: [],
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
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setContent: (state, { payload }: PayloadAction<boolean>) => {
      state.content = payload;
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
        payload: { name, array },
      }: PayloadAction<{
        name: KeysMatching<MainState, string[]>;
        array: string[];
      }>
    ) => {
      state[name] = array;
    },
    setSetListState: (
      state,
      {
        payload: { name, array },
      }: PayloadAction<{
        name: KeysMatching<MainState, SetType[]>;
        array: SetType[];
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
        prop: "id" | "alias" | "name";
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
    mergeWhitelist: (state, { payload }: PayloadAction<Partial<WhitelistType>>) => {
      const edited = removeDuplicates([...(state.whitelist.edited ?? []), ...Object.keys(payload)]);
      state.whitelist = { ...state.whitelist, ...payload, edited };
    },
    setURLWhitelist: (state, { payload }: PayloadAction<Partial<WhitelistType>>) => {
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
    setLinkedFavorites: (state, { payload }: PayloadAction<{ array: string[]; displayName: string }>) => {
      state.linkedFavorites = payload;
    },
  },
});

export const {
  actions: {
    setTransition,
    setLoading,
    setContent,
    setSort,
    setSortOrder,
    setListState,
    setSetListState,
    setSetGroups,
    setURLSetState,
    setSearch,
    setWhitelist,
    mergeWhitelist,
    setURLWhitelist,
    setCurrentPreset,
    setDefaultPreset,
    setAppPresets,
    setLinkedFavorites,
  },
} = mainSlice;

export const setList = <P extends Parameters<typeof setListState>[0]>(name: P["name"], array: P["array"]) =>
  setListState({ name, array });

export const setSetList = <P extends Parameters<typeof setSetListState>[0]>(name: P["name"], array: P["array"]) =>
  setSetListState({ name, array });

export const setURLSet = <P extends Parameters<typeof setURLSetState>[0]>(prop: P["prop"], value: P["value"]) =>
  setURLSetState({ prop, value });

export const selectTransition = (state: RootState) => state.main.transition;

export const selectLoading = (state: RootState) => state.main.loading;

export const selectContent = (state: RootState) => state.main.content;

export const selectSort = (state: RootState) => state.main.sort;

export const selectSortOrder = (state: RootState) => state.main.sortOrder;

export const selectAllDesigners = (state: RootState) => state.main.allDesigners;

export const selectAllProfiles = (state: RootState) => state.main.allProfiles;

export const selectAllRegions = (state: RootState) => state.main.allRegions;

export const selectAllVendors = (state: RootState) => state.main.allVendors;

export const selectAllVendorRegions = (state: RootState) => state.main.allVendorRegions;

export const selectAllSets = (state: RootState) => state.main.allSets;

export const selectFilteredSets = (state: RootState) => state.main.filteredSets;

export const selectSetGroups = (state: RootState) => state.main.setGroups;

export const selectURLSet = (state: RootState) => state.main.urlSet;

export const selectSearch = (state: RootState) => state.main.search;

export const selectWhitelist = (state: RootState) => state.main.whitelist;

export const selectCurrentPreset = (state: RootState) => state.main.currentPreset;

export const selectDefaultPreset = (state: RootState) => state.main.defaultPreset;

export const selectAppPresets = (state: RootState) => state.main.appPresets;

export const selectLinkedFavorites = (state: RootState) => state.main.linkedFavorites;

export const selectURLWhitelist = (state: RootState) => state.main.urlWhitelist;

export default mainSlice.reducer;
