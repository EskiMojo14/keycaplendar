import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { DateTime } from "luxon";
import { is } from "typescript-is";
import { notify } from "~/app/snackbar-queue";
import type { AppThunk, RootState } from "~/app/store";
import { mainPages } from "@s/common/constants";
import {
  arraySorts,
  dateSorts,
  pageSort,
  pageSortOrder,
  showAllPages,
  sortHiddenCheck,
} from "@s/main/constants";
import { partialPreset } from "@s/main/constructors";
import {
  selectBought,
  selectFavorites,
  selectHidden,
  selectUser,
  selectUserPresetMap,
} from "@s/user";
import {
  alphabeticalSort,
  alphabeticalSortCurried,
  alphabeticalSortPropCurried,
  arrayIncludes,
  hasKey,
  normalise,
  removeDuplicates,
  replaceFunction,
} from "@s/util/functions";
import type {
  OldPresetType,
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
  initialLoad: boolean;
  keysets: EntityState<SetType>;
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
  initialLoad: true,
  keysets: keysetAdapter.getInitialState(),
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
    upsertAppPreset: (state, { payload }: PayloadAction<PresetType>) => {
      appPresetAdapter.upsertOne(state.presets, payload);
    },
  },
});

export const {
  actions: {
    addAppPreset,
    deleteAppPreset,
    deleteSet,
    mergeWhitelist,
    setAllSets,
    setAppPresets,
    setCurrentPreset,
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
    upsertAppPreset,
  },
} = mainSlice;

export const selectTransition = (state: RootState) => state.main.transition;

export const selectLoading = (state: RootState) => state.main.loading;

export const selectInitialLoad = (state: RootState) => state.main.initialLoad;

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

/**
 * Tests whether a set would be shown on each page.
 * @param set Set to be tested.
 * @param favorites Array of set IDs which are favorited.
 * @param bought Array of set IDs which are bought.
 * @param hidden Array of set IDs which are hidden.
 * @returns Object with page keys, containing a boolean of if that set would be shown on the page.
 */

export const pageConditions = (
  set: SetType,
  favorites: EntityId[],
  bought: EntityId[],
  hidden: EntityId[],
  linkedFavorites: MainState["linkedFavorites"]
): Record<typeof mainPages[number], boolean> => {
  const today = DateTime.utc();
  const yesterday = today.minus({ days: 1 });
  const startDate = DateTime.fromISO(set.gbLaunch, {
    zone: "utc",
  });
  const endDate = DateTime.fromISO(set.gbEnd).set({
    hour: 23,
    millisecond: 999,
    minute: 59,
    second: 59,
  });
  return {
    archive: true,
    bought: bought.includes(set.id),
    calendar:
      startDate > today ||
      (startDate <= today && (endDate >= yesterday || !set.gbEnd)),
    favorites:
      linkedFavorites.array.length > 0
        ? linkedFavorites.array.includes(set.id)
        : favorites.includes(set.id),
    hidden: hidden.includes(set.id),
    ic: !set.gbLaunch || set.gbLaunch.includes("Q"),
    live: startDate <= today && (endDate >= yesterday || !set.gbEnd),
    previous: !!(endDate && endDate <= yesterday),
    timeline: !!(set.gbLaunch && !set.gbLaunch.includes("Q")),
  };
};

// avoid circular import
export const selectPage = (state: RootState) => state.common.page;

export const selectFilteredSets = createSelector(
  selectPage,
  selectAllSets,
  selectSearch,
  selectWhitelist,
  selectFavorites,
  selectBought,
  selectHidden,
  selectUser,
  selectInitialLoad,
  selectLinkedFavorites,
  (
    page,
    sets,
    search,
    whitelist,
    favorites,
    bought,
    hidden,
    user,
    initialLoad,
    linkedFavorites
  ) => {
    if (initialLoad) {
      return [];
    }

    // filter bool functions

    const hiddenBool = (set: SetType) => {
      if (
        showAllPages.includes(page) ||
        (whitelist.hidden === "all" && user.email)
      ) {
        return true;
      } else if (
        (whitelist.hidden === "hidden" && user.email) ||
        page === "hidden"
      ) {
        return hidden.includes(set.id);
      } else {
        return !hidden.includes(set.id);
      }
    };

    const pageBool = (set: SetType): boolean => {
      if (arrayIncludes(mainPages, page)) {
        return pageConditions(set, favorites, bought, hidden, linkedFavorites)[
          page
        ];
      }
      return false;
    };

    const vendorBool = (set: SetType) => {
      if (set.vendors) {
        const included = set.vendors.some((vendor) =>
          whitelist.vendors.includes(vendor.name)
        );
        return whitelist.vendorMode === "exclude" ? !included : included;
      }
      return false;
    };

    const regionBool = (set: SetType) => {
      if (set.vendors) {
        return set.vendors.some((vendor) =>
          vendor.region
            .split(", ")
            .some((region) => whitelist.regions.includes(region))
        );
      }
      return false;
    };

    const filterBool = (set: SetType) => {
      const shippedBool =
        (whitelist.shipped.includes("Shipped") && set.shipped) ||
        (whitelist.shipped.includes("Not shipped") && !set.shipped);
      const favoritesBool = user.email
        ? !whitelist.favorites ||
          (whitelist.favorites && favorites.includes(set.id))
        : true;
      const boughtBool = user.email
        ? !whitelist.bought || (whitelist.bought && bought.includes(set.id))
        : true;
      if (set.vendors && set.vendors.length > 0) {
        return (
          vendorBool(set) &&
          regionBool(set) &&
          whitelist.profiles.includes(set.profile) &&
          shippedBool &&
          favoritesBool &&
          boughtBool
        );
      } else {
        if (
          (whitelist.vendors.length === 1 &&
            whitelist.vendorMode === "include") ||
          whitelist.regions.length === 1
        ) {
          return false;
        } else {
          return (
            whitelist.profiles.includes(set.profile) &&
            shippedBool &&
            favoritesBool &&
            boughtBool
          );
        }
      }
    };

    const searchBool = (set: SetType) => {
      const setInfo = [
        set.profile,
        set.colorway,
        normalise(replaceFunction(set.colorway)),
        set.designer.join(" "),
        set.vendors
          ? set.vendors.map((vendor) => ` ${vendor.name} ${vendor.region}`)
          : "",
      ];
      const bool = search
        .toLowerCase()
        .split(" ")
        .every((term) =>
          setInfo.join(" ").toLowerCase().includes(term.toLowerCase())
        );
      return search.length > 0 ? bool : true;
    };

    return sets.filter(
      (set) =>
        hiddenBool(set) && pageBool(set) && filterBool(set) && searchBool(set)
    );
  }
);

export const selectFilteredSetsIds = createSelector(
  selectFilteredSets,
  (filteredSets) => filteredSets.map(keysetAdapter.selectId)
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
  selectFilteredSets,
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
      notify({
        title: `${selectSortHiddenSets(
          getState()
        )} sets hidden due to sort setting.`,
      });
    },
    predicate: (action, state): action is ReturnType<typeof setSort> =>
      setSort.match(action) &&
      sortHiddenCheck[selectSort(state)].includes(selectPage(state)) &&
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

export const updatePreset =
  (preset: OldPresetType | PresetType): AppThunk<PresetType> =>
  (dispatch, getState) => {
    const allRegions = selectAllRegions(getState());
    const regions = preset.whitelist.regions ?? allRegions;
    const bought = !!preset.whitelist.bought ?? false;
    const hidden = is<boolean>(preset.whitelist.hidden)
      ? preset.whitelist.hidden
        ? "hidden"
        : "unhidden"
      : preset.whitelist.hidden;
    const updatedPreset: PresetType = {
      ...preset,
      whitelist: { ...preset.whitelist, bought, hidden, regions },
    };
    return updatedPreset;
  };
