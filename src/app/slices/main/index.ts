import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type {
  AnyAction,
  EntityId,
  EntityState,
  PayloadAction,
  ThunkAction,
} from "@reduxjs/toolkit";
import produce from "immer";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";
import type { RootState } from "~/app/store";
import { blankPreset } from "@s/main/constants";
import { partialSet } from "@s/main/constructors";
import { selectUserPresetMap } from "@s/user";
import {
  alphabeticalSortPropCurried,
  randomInt,
  removeDuplicates,
} from "@s/util/functions";
import type { KeysMatching, Overwrite } from "@s/util/types";
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

export const appPresetAdapter = createEntityAdapter<PresetType>({
  sortComparer: alphabeticalSortPropCurried("name", false, "Default"),
});

export type MainState = {
  allDesigners: string[];
  allProfiles: string[];
  allRegions: string[];
  allSets: SetType[];
  allVendorRegions: string[];
  allVendors: string[];
  content: boolean;
  filteredSets: SetType[];
  initialLoad: boolean;
  linkedFavorites: { array: string[]; displayName: string };
  loading: boolean;
  presets: EntityState<PresetType> & {
    currentPreset: EntityId;
    defaultPreset: PresetType;
  };
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
  content: true,
  filteredSets: [],
  initialLoad: true,
  linkedFavorites: { array: [], displayName: "" },
  loading: true,
  presets: appPresetAdapter.getInitialState({
    currentPreset: "default",
    defaultPreset: blankPreset,
  }),
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
    addAppPreset: (state, { payload }: PayloadAction<PresetType>) => {
      appPresetAdapter.setOne(state.presets, payload);
    },
    deleteAppPreset: (state, { payload }: PayloadAction<EntityId>) => {
      appPresetAdapter.removeOne(state.presets, payload);
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
    setAppPresets: (state, { payload }: PayloadAction<PresetType[]>) => {
      appPresetAdapter.setAll(state.presets, payload);
    },
    setCurrentPreset: (
      state,
      { payload }: PayloadAction<"default" | (EntityId & Record<never, never>)>
    ) => {
      state.presets.currentPreset = payload;
    },
    setDefaultPreset: (state, { payload }: PayloadAction<PresetType>) => {
      state.presets.defaultPreset = payload;
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
    setList: {
      prepare: (name: KeysMatching<MainState, string[]>, array: string[]) => ({
        payload: { array, name },
      }),
      reducer: (
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
    setSetList: {
      prepare: (
        name: KeysMatching<MainState, SetType[]>,
        array: SetType[]
      ) => ({
        payload: { array, name },
      }),
      reducer: (
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
    setURLSet: {
      prepare: (prop: "alias" | "id" | "name", value: string) => ({
        payload: { prop, value },
      }),
      reducer: (
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
    upsertAppPreset: (state, { payload }: PayloadAction<PresetType>) => {
      appPresetAdapter.upsertOne(state.presets, payload);
    },
  },
});

export const {
  actions: {
    deleteAppPreset,
    mergeWhitelist,
    setAppPresets,
    setCurrentPreset,
    setDefaultPreset,
    setInitialLoad,
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
    upsertAppPreset,
  },
} = mainSlice;

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

export const selectLinkedFavorites = (state: RootState) =>
  state.main.linkedFavorites;

export const selectURLWhitelist = (state: RootState) => state.main.urlWhitelist;

export const selectWhitelist = (state: RootState) => state.main.whitelist;

export const selectCurrentPresetId = (state: RootState) =>
  state.main.presets.currentPreset;

export const selectDefaultPreset = (state: RootState) =>
  state.main.presets.defaultPreset;

export const {
  selectAll: selectAllAppPresets,
  selectById: selectAppPresetById,
  selectEntities: selectAppPresetMap,
  selectIds: selectAppPresetIds,
  selectTotal: selectAppPresetTotal,
} = appPresetAdapter.getSelectors((state: RootState) => state.main.presets);

export const selectCurrentPreset = createSelector(
  selectAppPresetMap,
  selectUserPresetMap,
  selectDefaultPreset,
  selectCurrentPresetId,
  (appPresets, userPresets, defaultPreset, currentId) =>
    currentId === "default"
      ? defaultPreset
      : appPresets[currentId] ?? userPresets[currentId] ?? defaultPreset
);

export const selectPresetById = createSelector(
  selectAppPresetMap,
  selectUserPresetMap,
  selectDefaultPreset,
  (state: RootState, id: "default" | (EntityId & Record<never, never>)) => id,
  (appPresets, userPresets, defaultPreset, presetId) =>
    presetId === "default"
      ? defaultPreset
      : appPresets[presetId] ?? userPresets[presetId]
);

export default mainSlice.reducer;

const {
  actions: { addAppPreset: _addAppPreset },
} = mainSlice;

export const addAppPreset =
  (
    userPreset: Overwrite<PresetType, { id?: string }>
  ): ThunkAction<PresetType, RootState, unknown, AnyAction> =>
  (dispatch) => {
    const preset = produce(userPreset, (draftPreset) => {
      draftPreset.id ??= nanoid();
    }) as PresetType;
    dispatch(_addAppPreset(preset));
    return preset;
  };
