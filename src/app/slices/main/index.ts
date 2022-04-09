import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";
import type { AppThunk, RootState } from "~/app/store";
import { partialPreset, partialSet } from "@s/main/constructors";
import { selectUserPresetMap } from "@s/user";
import {
  alphabeticalSort,
  alphabeticalSortPropCurried,
  randomInt,
  removeDuplicates,
} from "@s/util/functions";
import type { Overwrite } from "@s/util/types";
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

export const keysetAdapter = createEntityAdapter<SetType>({
  sortComparer: alphabeticalSortPropCurried("colorway"),
});

export const appPresetAdapter = createEntityAdapter<PresetType>({
  sortComparer: alphabeticalSortPropCurried("name", false, "Default"),
});

export const setGroupAdapter = createEntityAdapter<SetGroup>({
  selectId: ({ title }) => title,
});

export type MainState = {
  content: boolean;
  initialLoad: boolean;
  keysets: EntityState<SetType> & {
    filteredSets: EntityId[];
    setGroups: EntityState<SetGroup>;
  };
  linkedFavorites: { array: string[]; displayName: string };
  loading: boolean;
  presets: EntityState<PresetType> & {
    currentPreset: EntityId;
  };
  search: string;
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
  content: true,
  initialLoad: true,
  keysets: keysetAdapter.getInitialState({
    filteredSets: [],
    setGroups: setGroupAdapter.setAll(
      setGroupAdapter.getInitialState(),
      generateRandomSetGroups()
    ),
  }),
  linkedFavorites: { array: [], displayName: "" },
  loading: true,
  presets: appPresetAdapter.getInitialState({
    currentPreset: "default",
  }),
  search: "",
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
    deleteSet: (state, { payload }: PayloadAction<EntityId>) => {
      keysetAdapter.removeOne(state.keysets, payload);
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
    setAllSets: (state, { payload }: PayloadAction<SetType[]>) => {
      keysetAdapter.setAll(state.keysets, payload);
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
    setFilteredSets: (state, { payload }: PayloadAction<EntityId[]>) => {
      state.keysets.filteredSets = payload;
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
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setSearch: (state, { payload }: PayloadAction<string>) => {
      state.search = payload;
    },
    setSet: (state, { payload }: PayloadAction<SetType>) => {
      keysetAdapter.setOne(state.keysets, payload);
    },
    setSetGroups: (state, { payload }: PayloadAction<SetGroup[]>) => {
      setGroupAdapter.setAll(state.keysets.setGroups, payload);
    },
    setSetGroupsIds: (state, { payload }: PayloadAction<EntityId[]>) => {
      state.keysets.setGroups.ids = payload;
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
    deleteSet,
    mergeWhitelist,
    setAllSets,
    setAppPresets,
    setCurrentPreset,
    setFilteredSets,
    setInitialLoad,
    setLinkedFavorites,
    setLoading,
    setSearch,
    setSet,
    setSetGroups,
    setSetGroupsIds,
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

export const selectURLSet = (state: RootState) => state.main.urlSet;

export const selectSearch = (state: RootState) => state.main.search;

export const selectLinkedFavorites = (state: RootState) =>
  state.main.linkedFavorites;

export const selectURLWhitelist = (state: RootState) => state.main.urlWhitelist;

export const selectWhitelist = (state: RootState) => state.main.whitelist;

export const selectCurrentPresetId = (state: RootState) =>
  state.main.presets.currentPreset;

export const {
  selectAll: selectAllSets,
  selectById: selectSetById,
  selectEntities: selectSetMap,
  selectIds: selectSetIds,
  selectTotal: selectSetTotal,
} = keysetAdapter.getSelectors((state: RootState) => state.main.keysets);

export const selectURLKeyset = createSelector(
  selectAllSets,
  selectSetMap,
  selectURLSet,
  (allSets, setMap, { prop, value }) => {
    if (!value) {
      return undefined;
    } else if (prop === "id") {
      return setMap[value];
    } else if (prop === "name") {
      return allSets.find((set) => value === `${set.profile} ${set.colorway}`);
    } else {
      return allSets.find((set) => set[prop] === value);
    }
  }
);

export const selectFilteredSetsIds = (state: RootState) =>
  state.main.keysets.filteredSets;

export const selectFilteredSets = createSelector(
  selectSetMap,
  selectFilteredSetsIds,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  (entities, ids) => ids.map((id) => entities[id]!)
);

export const {
  selectAll: selectAllSetGroups,
  selectById: selectSetGroupByTitle,
  selectEntities: selectSetGroupMap,
  selectIds: selectSetGroupTitles,
  selectTotal: selectSetGroupTotal,
} = setGroupAdapter.getSelectors(
  (state: RootState) => state.main.keysets.setGroups
);

export const selectAllDesigners = createSelector(selectAllSets, (sets) =>
  alphabeticalSort(
    removeDuplicates(sets.map((set) => set.designer ?? []).flat())
  )
);

export const selectAllProfiles = createSelector(selectAllSets, (sets) =>
  alphabeticalSort(removeDuplicates(sets.map((set) => set.profile)))
);

export const selectAllRegions = createSelector(selectAllSets, (sets) =>
  alphabeticalSort(
    removeDuplicates(
      sets
        .map((set) =>
          set.vendors
            ? set.vendors.map((vendor) => vendor.region.split(", "))
            : []
        )
        .flat(2)
    )
  )
);

export const selectAllVendors = createSelector(selectAllSets, (sets) =>
  alphabeticalSort(
    removeDuplicates(
      sets.map((set) => set.vendors?.map((vendor) => vendor.name) ?? []).flat()
    )
  )
);

export const selectAllVendorRegions = createSelector(selectAllSets, (sets) =>
  alphabeticalSort(
    removeDuplicates(
      sets
        .map(
          (set) =>
            set.vendors?.map((vendor) => [
              vendor.region,
              ...vendor.region.split(", "),
            ]) ?? []
        )
        .flat(2)
    )
  )
);

export const selectDefaultPreset = createSelector(
  selectAllProfiles,
  selectAllRegions,
  (profiles, regions) =>
    partialPreset({
      id: "default",
      name: "Default",
      whitelist: {
        profiles,
        regions,
      },
    })
);

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

export const selectSearchTerms = createSelector(
  selectFilteredSets,
  (filteredSets) =>
    alphabeticalSort([
      ...filteredSets.reduce<Set<string>>((searchTerms, set) => {
        searchTerms.add(set.profile);
        searchTerms.add(set.colorway);
        set.designer.forEach((designer) => {
          searchTerms.add(designer);
        });
        set.vendors?.forEach((vendor) => {
          searchTerms.add(vendor.name);
        });

        return searchTerms;
      }, new Set()),
    ])
);

export default mainSlice.reducer;

const {
  actions: { addAppPreset: _addAppPreset },
} = mainSlice;

export const addAppPreset =
  (userPreset: Overwrite<PresetType, { id?: string }>): AppThunk<PresetType> =>
  (dispatch) => {
    const preset: PresetType = { ...userPreset, id: userPreset.id ?? nanoid() };
    dispatch(_addAppPreset(preset));
    return preset;
  };
