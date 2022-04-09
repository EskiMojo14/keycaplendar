import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";
import { shallowEqual } from "react-redux";
import { queue } from "~/app/snackbar-queue";
import type { AppThunk, RootState } from "~/app/store";
import { selectPage } from "@s/common";
import { mainPages } from "@s/common/constants";
import {
  arraySorts,
  dateSorts,
  pageSort,
  pageSortOrder,
  sortHiddenCheck,
} from "@s/main/constants";
import { partialPreset } from "@s/main/constructors";
import { selectUserPresetMap } from "@s/user";
import {
  alphabeticalSort,
  alphabeticalSortCurried,
  alphabeticalSortPropCurried,
  arrayIncludes,
  hasKey,
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
import type { AppStartListening } from "~/app/middleware/listener";

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

export const selectSetGroups = createSelector(
  selectFilteredSets,
  selectPage,
  selectSort,
  selectSortOrder,
  (sets, page, sort, sortOrder) => {
    const createSetGroups = (sets: SetType[]): string[] => {
      if (arrayIncludes(dateSorts, sort)) {
        return sets
          .map((set) => {
            if (set[sort]) {
              const setDate = DateTime.fromISO(set[sort], {
                zone: "utc",
              });
              const setMonth = setDate.toFormat("MMMM yyyy");
              return setMonth;
            }
            return "";
          })
          .filter(Boolean);
      } else if (arrayIncludes(arraySorts, sort)) {
        return sets.map((set) => set[sort]).flat();
      } else if (sort === "vendor") {
        return sets
          .map((set) => set.vendors?.map((vendor) => vendor.name) ?? [])
          .flat();
      } else {
        return sets.map((set) => `${set[sort]}`).filter(Boolean);
      }
    };
    const groupTitles = removeDuplicates(createSetGroups(sets)).sort((a, b) => {
      if (arrayIncludes(dateSorts, sort)) {
        const aDate = DateTime.fromFormat(a, "MMMM yyyy", { zone: "utc" });
        const bDate = DateTime.fromFormat(b, "MMMM yyyy", { zone: "utc" });
        return alphabeticalSortCurried(sortOrder === "descending")(
          aDate,
          bDate
        );
      }
      return alphabeticalSortCurried()(a, b);
    });

    const filterSets = (sets: SetType[], group: string, sort: SortType) => {
      const filteredSets = sets.filter((set) => {
        if (hasKey(set, sort) || sort === "vendor") {
          if (arrayIncludes(dateSorts, sort)) {
            const { [sort]: val } = set;
            const setDate = DateTime.fromISO(val, { zone: "utc" });
            const setMonth = setDate.toFormat("MMMM yyyy");
            return !!setMonth && setMonth === group;
          } else if (sort === "vendor") {
            return !!set.vendors?.some((vendor) => vendor.name === group);
          } else if (sort === "designer") {
            return set.designer.includes(group);
          } else {
            return set[sort] === group;
          }
        } else {
          return false;
        }
      });
      const defaultSort = arrayIncludes(mainPages, page)
        ? pageSort[page]
        : "icDate";
      const defaultSortOrder = arrayIncludes(mainPages, page)
        ? pageSortOrder[page]
        : "descending";
      const dateSort = (
        a: SetType,
        b: SetType,
        prop = sort,
        order = sortOrder
      ) => {
        const aName = `${a.profile.toLowerCase()} ${a.colorway.toLowerCase()}`;
        const bName = `${b.profile.toLowerCase()} ${b.colorway.toLowerCase()}`;
        const nameSort = alphabeticalSortCurried()(aName, bName);
        if (arrayIncludes(dateSorts, prop)) {
          const { [prop]: aProp } = a;
          const aDate =
            aProp && !aProp.includes("Q")
              ? DateTime.fromISO(aProp, { zone: "utc" })
              : null;
          const { [prop]: bProp } = b;
          const bDate =
            bProp && !bProp.includes("Q")
              ? DateTime.fromISO(bProp, { zone: "utc" })
              : null;
          const returnVal = order === "ascending" ? 1 : -1;
          if (aDate && bDate) {
            if (aDate > bDate) {
              return returnVal;
            } else if (aDate < bDate) {
              return -returnVal;
            }
            return nameSort;
          }
          return nameSort;
        }
        return nameSort;
      };
      filteredSets.sort((a, b) => {
        const aName = `${a.profile.toLowerCase()} ${a.colorway.toLowerCase()}`;
        const bName = `${b.profile.toLowerCase()} ${b.colorway.toLowerCase()}`;
        const nameSort = alphabeticalSortCurried()(aName, bName);
        if (arrayIncludes(dateSorts, sort)) {
          if (sort === "gbLaunch" && (a.gbMonth || b.gbMonth)) {
            if (a.gbMonth && b.gbMonth) {
              return nameSort;
            } else {
              return a.gbMonth ? 1 : -1;
            }
          }
          return dateSort(a, b, sort, sortOrder);
        } else if (arrayIncludes(dateSorts, defaultSort)) {
          return dateSort(a, b, defaultSort, defaultSortOrder);
        }
        return nameSort;
      });
      return filteredSets.map(keysetAdapter.selectId);
    };

    return setGroupAdapter.setAll(
      setGroupAdapter.getInitialState(),
      groupTitles.map<SetGroup>((group) => ({
        sets: filterSets(sets, group, sort),
        title: group,
      }))
    );
  }
);

export const {
  selectAll: selectAllSetGroups,
  selectById: selectSetGroupByTitle,
  selectEntities: selectSetGroupMap,
  selectIds: selectSetGroupTitles,
  selectTotal: selectSetGroupTotal,
} = setGroupAdapter.getSelectors(selectSetGroups);

export const selectSortHiddenSets = createSelector(
  selectAllSetGroups,
  selectAllSets,
  (setGroups, sets) => {
    const allGroupedSets = removeDuplicates(
      setGroups.map((group) => group.sets).flat()
    );

    return sets.length - allGroupedSets.length;
  }
);

export const setupHiddenSetsListener = (startListening: AppStartListening) =>
  startListening({
    effect: (action, { getState }) => {
      queue.notify({
        title: `${selectSortHiddenSets(
          getState()
        )} sets hidden due to sort setting.`,
      });
    },
    predicate: (action, state, originalState) =>
      sortHiddenCheck[selectSort(state)].includes(selectPage(state)) &&
      !shallowEqual(
        selectFilteredSets(state),
        selectFilteredSets(originalState)
      ) &&
      selectSortHiddenSets(state) > 0,
  });

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
