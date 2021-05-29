import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { uniqueArray } from "../common/functions";
import { Preset } from "./constructors";
import { PresetType, SetGroup, SetType, SortOrderType, SortType, WhitelistType } from "./types";

type MainState = {
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
  urlSet: string;

  search: string;
  whitelist: WhitelistType;
  currentPreset: PresetType;
  defaultPreset: PresetType;
  appPresets: PresetType[];
};

const initialState: MainState = {
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
  urlSet: "",

  // filters

  search: "",
  whitelist: {
    edited: [],
    favorites: false,
    hidden: false,
    profiles: [],
    shipped: ["Shipped", "Not shipped"],
    regions: [],
    vendorMode: "exclude",
    vendors: [],
  },
  currentPreset: { ...new Preset() },
  defaultPreset: { ...new Preset() },
  appPresets: [],
};

export const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    setTransition: (state, action: PayloadAction<boolean>) => {
      state.transition = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setContent: (state, action: PayloadAction<boolean>) => {
      state.content = action.payload;
    },
    setSort: (state, action: PayloadAction<SortType>) => {
      state.sort = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<SortOrderType>) => {
      state.sortOrder = action.payload;
    },
    setList: (
      state,
      action: PayloadAction<{
        name: "allDesigners" | "allProfiles" | "allRegions" | "allVendors" | "allVendorRegions";
        array: string[];
      }>
    ) => {
      const { name, array } = action.payload;
      state = Object.assign(state, { [name]: array });
    },
    setSetList: (
      state,
      action: PayloadAction<{
        name: "allSets" | "filteredSets";
        array: SetType[];
      }>
    ) => {
      const { name, array } = action.payload;
      state = Object.assign(state, { [name]: array });
    },
    setSetGroups: (state, action: PayloadAction<SetGroup[]>) => {
      state.setGroups = action.payload;
    },
    setURLSet: (state, action: PayloadAction<string>) => {
      state.urlSet = action.payload;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setWhitelist: (state, action: PayloadAction<WhitelistType>) => {
      state.whitelist = Object.assign(action.payload, { edited: Object.keys(action.payload) });
    },
    mergeWhitelist: (state, action: PayloadAction<Partial<WhitelistType>>) => {
      const edited = uniqueArray([...(state.whitelist.edited || []), ...Object.keys(action.payload)]);
      state.whitelist = Object.assign(state.whitelist, action.payload, { edited: edited });
    },
    setCurrentPreset: (state, action: PayloadAction<PresetType>) => {
      state.currentPreset = action.payload;
    },
    setDefaultPreset: (state, action: PayloadAction<PresetType>) => {
      state.defaultPreset = action.payload;
    },
    setAppPresets: (state, action: PayloadAction<PresetType[]>) => {
      state.appPresets = action.payload;
    },
  },
});

export const {
  setTransition,
  setLoading,
  setContent,
  setSort,
  setSortOrder,
  setList,
  setSetList,
  setSetGroups,
  setURLSet,
  setSearch,
  setWhitelist,
  mergeWhitelist,
  setCurrentPreset,
  setDefaultPreset,
  setAppPresets,
} = mainSlice.actions;

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

export default mainSlice.reducer;
