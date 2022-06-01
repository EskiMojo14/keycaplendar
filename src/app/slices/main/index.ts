import {
  createDraftSafeSelector,
  createEntityAdapter,
  createSelector,
  createSlice,
  isAnyOf,
} from "@reduxjs/toolkit";
import type {
  Dictionary,
  EntityId,
  EntityState,
  PayloadAction,
} from "@reduxjs/toolkit";
import { DateTime } from "luxon";
import { matchPath } from "react-router-dom";
import { history } from "~/app/history";
import { notify } from "~/app/snackbar-queue";
import type { AppThunk, RootState } from "~/app/store";
import type { AppStartListening } from "@mw/listener";
// eslint-disable-next-line import/no-cycle
import { combineListeners } from "@mw/listener/functions";
import baseApi from "@s/api";
import { createErrorMessagesListeners } from "@s/api/functions";
import { commonApi } from "@s/common";
import firestore from "@s/firebase/firestore";
import {
  arraySorts,
  dateSorts,
  defaultSorts,
  showAllPages,
  sortHiddenCheck,
} from "@s/main/constants";
import { partialPreset } from "@s/main/constructors";
import { updatePreset as _updatePreset, addLastDate } from "@s/main/functions";
import {
  getLocatedSelectors,
  getPageName,
  navigationMatcher,
  selectLocation,
  selectPage,
} from "@s/router";
import { mainPages } from "@s/router/constants";
import type { MainPage } from "@s/router/types";
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
  objectFromEntries,
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

export const keysetAdapter = createEntityAdapter<SetType>({
  sortComparer: alphabeticalSortPropCurried("colorway"),
});

export const appPresetAdapter = createEntityAdapter<PresetType>({
  sortComparer: alphabeticalSortPropCurried("name", false, "Default"),
});

export const setGroupAdapter = createEntityAdapter<SetGroup>({
  selectId: ({ title }) => title,
});

export const mainApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllKeysets: build.query<EntityState<SetType>, void>({
      queryFn: async () => {
        try {
          const querySnapshot = await firestore.collection("keysets").get();
          const sets: SetType[] = [];
          querySnapshot.forEach((doc) => {
            if (doc.data().profile) {
              const {
                gbLaunch: docGbLaunch,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                latestEditor,
                ...data
              } = doc.data();

              sets.push({
                id: doc.id,
                ...data,
                gbLaunch:
                  data.gbMonth && docGbLaunch && !docGbLaunch.includes("Q")
                    ? addLastDate(docGbLaunch)
                    : docGbLaunch,
              });
            }
          });
          return {
            data: keysetAdapter.setAll(keysetAdapter.getInitialState(), sets),
          };
        } catch (error) {
          return { error };
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const { useGetAllKeysetsQuery } = mainApi;

export const setupMainListeners = combineListeners((startListening) =>
  createErrorMessagesListeners(
    mainApi.endpoints,
    { getAllKeysets: "Failed to get keysets" },
    startListening
  )
);

export type MainState = {
  keysets: EntityState<SetType>;
  linkedFavorites: { array: EntityId[]; displayName: string };
  linkedFavoritesLoading: boolean;
  loading: boolean;
  presets: EntityState<PresetType> & {
    currentPreset: EntityId;
  };
  search: string;
  sorts: Record<MainPage, { sort: SortType; sortOrder: SortOrderType }>;
  transition: boolean;
  whitelist: Partial<WhitelistType>;
};

export const initialState: MainState = {
  keysets: keysetAdapter.getInitialState(),
  linkedFavorites: { array: [], displayName: "" },
  linkedFavoritesLoading: false,
  loading: true,
  presets: appPresetAdapter.getInitialState({
    currentPreset: "default",
  }),
  search: "",
  sorts: defaultSorts,
  transition: false,
  whitelist: {},
};

export const mainSlice = createSlice({
  extraReducers: (builder) => {
    builder
      .addMatcher(
        commonApi.endpoints.getGlobals.matchFulfilled,
        (state, { payload: { filterPresets } }) => {
          appPresetAdapter.setAll(state.presets, filterPresets as PresetType[]);
        }
      )
      .addMatcher(mainApi.endpoints.getAllKeysets.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(
        mainApi.endpoints.getAllKeysets.matchFulfilled,
        (state, { payload }) => {
          keysetAdapter.setAll(
            state.keysets,
            payload.entities as Record<EntityId, SetType>
          );
        }
      )
      .addMatcher(
        isAnyOf(
          mainApi.endpoints.getAllKeysets.matchFulfilled,
          mainApi.endpoints.getAllKeysets.matchRejected
        ),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(navigationMatcher, (state) => {
        ({ linkedFavorites: state.linkedFavorites, search: state.search } =
          initialState);
      });
  },
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
      Object.assign(state.whitelist, payload);
    },
    resetWhitelist: (state) => {
      ({ whitelist: state.whitelist } = initialState);
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
    setLinkedFavorites: (
      state,
      { payload }: PayloadAction<{ array: string[]; displayName: string }>
    ) => {
      state.linkedFavorites = payload;
    },
    setLinkedFavoritesLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.linkedFavoritesLoading = payload;
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
    setSort: {
      prepare: (page: MainPage, sort: SortType) => ({
        payload: { page, sort },
      }),
      reducer: (
        state,
        {
          payload: { page, sort },
        }: PayloadAction<{ page: MainPage; sort: SortType }>
      ) => {
        state.sorts[page].sort = sort;
      },
    },
    setSortOrder: {
      prepare: (page: MainPage, sortOrder: SortOrderType) => ({
        payload: { page, sortOrder },
      }),
      reducer: (
        state,
        {
          payload: { page, sortOrder },
        }: PayloadAction<{ page: MainPage; sortOrder: SortOrderType }>
      ) => {
        state.sorts[page].sortOrder = sortOrder;
      },
    },
    setTransition: (state, { payload }: PayloadAction<boolean>) => {
      state.transition = payload;
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
    resetWhitelist,
    setAppPresets,
    setCurrentPreset,
    setLinkedFavorites,
    setLinkedFavoritesLoading,
    setLoading,
    setSearch,
    setSet,
    setSort,
    setSortOrder,
    setTransition,
    upsertAppPreset,
  },
} = mainSlice;

export const selectTransition = (state: RootState) => state.main.transition;

export const selectLoading = (state: RootState) => state.main.loading;

export const selectLinkedFavoritesLoading = (state: RootState) =>
  state.main.linkedFavoritesLoading;

export const selectSortsMap = (state: RootState) => state.main.sorts;

export const selectSortsByPage = createSelector(
  selectSortsMap,
  (state: RootState, page: MainPage) => page,
  (sortsMap, page) => sortsMap[page]
);

export const selectSortByPage = createSelector(
  selectSortsByPage,
  (sorts) => sorts.sort
);

export const selectSortOrderByPage = createSelector(
  selectSortsByPage,
  (sorts) => sorts.sortOrder
);

export const selectSorts = createSelector(
  selectSortsMap,
  selectPage,
  (sortsMap, page) => {
    if (arrayIncludes(mainPages, page)) {
      return sortsMap[page];
    }
    return sortsMap.calendar;
  }
);

export const selectSort = createSelector(selectSorts, (sorts) => sorts.sort);

export const selectSortOrder = createSelector(
  selectSorts,
  (sorts) => sorts.sortOrder
);

export const selectSearch = (state: RootState) => state.main.search;

export const selectLinkedFavorites = (state: RootState) =>
  state.main.linkedFavorites;

export const selectCurrentPresetId = (state: RootState) =>
  state.main.presets.currentPreset;

export const {
  selectAll: selectAllSets,
  selectById: selectSetById,
  selectEntities: selectSetMap,
  selectIds: selectSetIds,
  selectTotal: selectSetTotal,
} = keysetAdapter.getSelectors((state: RootState) => state.main.keysets);

export const selectSetsByAlias = createSelector(selectAllSets, (allSets) =>
  allSets.reduce<Dictionary<SetType>>((dict, set) => {
    dict[set.alias] = set;
    return dict;
  }, {})
);

export const selectSetsByName = createSelector(selectAllSets, (allSets) =>
  allSets.reduce<Dictionary<SetType>>((dict, set) => {
    dict[`${set.profile} ${set.colorway}`] = set;
    return dict;
  }, {})
);

export const findKeysetByString = (
  string: string,
  setMap: Dictionary<SetType>,
  setsByAlias: Dictionary<SetType>,
  setsByName: Dictionary<SetType>
) =>
  string
    ? setMap[string] ?? // /:id
      setsByAlias[string] ?? // /:alias
      setsByName[string] // /:profile%20:colorway
    : undefined;

export const selectKeysetByString = createSelector(
  (_: unknown, string: string) => string,
  selectSetMap,
  selectSetsByAlias,
  selectSetsByName,
  findKeysetByString
);

export const selectURLKeyset = createSelector(
  selectLocation,
  selectSetMap,
  selectSetsByAlias,
  selectSetsByName,
  (location, setMap, setsByAlias, setsByName) => {
    const result = matchPath<{ page: string; keyset?: string }>(
      location.pathname,
      "/:page/:keyset"
    );
    const keyset = result?.params.keyset;
    if (keyset) {
      return findKeysetByString(keyset, setMap, setsByAlias, setsByName);
    } else {
      return undefined;
    }
  }
);

export const selectAllDesigners = createSelector(selectAllSets, (sets) =>
  alphabeticalSort(
    removeDuplicates(sets.map((set) => set.designer ?? []).flat())
  )
);

export const selectAllProfiles = createSelector(selectAllSets, (sets) =>
  alphabeticalSort(removeDuplicates(sets.map((set) => set.profile)))
);

export const selectAllRegions = createDraftSafeSelector(selectAllSets, (sets) =>
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

export const selectEditedWhitelist = (state: RootState) => state.main.whitelist;

export const selectWhitelist = createSelector(
  selectEditedWhitelist,
  selectCurrentPreset,
  selectDefaultPreset,
  (editedWhitelist, currentPreset, defaultPreset): WhitelistType => ({
    ...defaultPreset.whitelist,
    ...currentPreset.whitelist,
    ...editedWhitelist,
  })
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

/**
 * Tests whether a set would be shown on a page.
 * @param set Set to be tested.
 * @param page
 * @returns if that set would be shown on the page.
 */

export const pageCondition = (
  set: SetType,
  page: typeof mainPages[number]
): boolean => {
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
  switch (page) {
    case "archive": {
      return true;
    }
    case "calendar":
      return (
        startDate > today ||
        (startDate <= today && (endDate >= yesterday || !set.gbEnd))
      );
    case "ic": {
      return !set.gbLaunch || set.gbLaunch.includes("Q");
    }
    case "live": {
      return startDate <= today && (endDate >= yesterday || !set.gbEnd);
    }
    case "previous": {
      return !!(endDate && endDate <= yesterday);
    }
    case "timeline": {
      return !!(set.gbLaunch && !set.gbLaunch.includes("Q"));
    }
    default: {
      return false;
    }
  }
};

/**
 * Tests whether a set would be shown on each page.
 * @param set Set to be tested.
 * @returns Object with page keys, containing a boolean of if that set would be shown on the page.
 */

export const pageConditions = (set: SetType) =>
  objectFromEntries<Record<typeof mainPages[number], boolean>>(
    mainPages.map((page) => [page, pageCondition(set, page)])
  );

export const selectSetsByPage = createSelector(selectAllSets, (sets) =>
  sets.reduce<Record<typeof mainPages[number], SetType[]>>((acc, set) => {
    mainPages.forEach((page) => {
      if (pageCondition(set, page)) {
        acc[page].push(set);
      }
    });
    return acc;
  }, objectFromEntries(mainPages.map((page) => [page, []])))
);

export const selectFilteredSets = createSelector(
  selectPage,
  selectSetMap,
  selectSetsByPage,
  selectSearch,
  selectWhitelist,
  selectFavorites,
  selectLinkedFavorites,
  selectBought,
  selectHidden,
  selectUser,
  (
    page,
    setMap,
    setsByPage,
    search,
    whitelist,
    favorites,
    linkedFavorites,
    bought,
    hidden,
    user
  ) => {
    if (!arrayIncludes(mainPages, page)) {
      return [];
    }

    let sets: SetType[] = [];
    switch (page) {
      case "favorites": {
        sets = (
          linkedFavorites.array.length ? linkedFavorites.array : favorites
        ).map((id) => setMap[id]!);
        break;
      }
      case "bought": {
        sets = bought.map((id) => setMap[id]!);
        break;
      }
      case "hidden": {
        sets = hidden.map((id) => setMap[id]!);
        break;
      }
      default: {
        ({ [page]: sets } = setsByPage);
      }
    }

    // filter bool functions

    const hiddenBool = (set: SetType) => {
      if (
        arrayIncludes(showAllPages, page) ||
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
      (set) => set && hiddenBool(set) && filterBool(set) && searchBool(set)
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
        ? defaultSorts[page].sort
        : "icDate";
      const defaultSortOrder = arrayIncludes(mainPages, page)
        ? defaultSorts[page].sortOrder
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
} = getLocatedSelectors(selectSetGroups);

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
          getState(),
          history.location
        )} sets hidden due to sort setting.`,
      });
    },
    predicate: (action, state): action is ReturnType<typeof setSort> =>
      setSort.match(action) &&
      arrayIncludes(
        sortHiddenCheck[selectSort(state, history.location)],
        getPageName(history.location.pathname)
      ) &&
      selectSortHiddenSets(state, history.location) > 0,
  });

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
    const regions = selectAllRegions(getState());
    return _updatePreset(preset, { regions });
  };
