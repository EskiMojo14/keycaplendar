import type { EntityId } from "@reduxjs/toolkit";
import { DateTime } from "luxon";
import { is } from "typescript-is";
import { queue } from "~/app/snackbar-queue";
import store from "~/app/store";
import type { AppThunk } from "~/app/store";
import { selectPage } from "@s/common";
import { mainPages } from "@s/common/constants";
import firestore from "@s/firebase/firestore";
import type { UserId } from "@s/firebase/types";
import {
  addUserPreset,
  deleteUserPreset,
  selectAllUserPresets,
  selectBought,
  selectFavorites,
  selectHidden,
  selectUser,
  upsertUserPreset,
} from "@s/user";
import {
  arrayIncludes,
  createURL,
  normalise,
  objectEntries,
  replaceFunction,
} from "@s/util/functions";
import {
  addAppPreset,
  deleteAppPreset,
  mergeWhitelist,
  selectAllAppPresets,
  selectAllRegions,
  selectAllSets,
  selectCurrentPreset,
  selectDefaultPreset,
  selectInitialLoad,
  selectLinkedFavorites,
  selectPresetById,
  selectSearch,
  selectSetTotal,
  selectURLWhitelist,
  selectWhitelist,
  setAllSets,
  setCurrentPreset,
  setFilteredSets,
  setInitialLoad,
  setLoading,
  setSearch as setMainSearch,
  setSort as setMainSort,
  setSortOrder as setMainSortOrder,
  setURLWhitelist,
  upsertAppPreset,
} from ".";
import {
  allSorts,
  dateSorts,
  reverseSortDatePages,
  showAllPages,
  whitelistParams,
} from "./constants";
import type {
  OldPresetType,
  PresetType,
  SetType,
  SortOrderType,
  SortType,
  VendorType,
  WhitelistType,
} from "./types";

const { dispatch } = store;

/**
 * Finds the last day of the given month and adds it to the end.
 * @param date YYYY-MM
 * @returns YYYY-MM-DD
 */
export const addLastDate = (date: string) => {
  const { daysInMonth: lastInMonth } = DateTime.fromISO(date);
  return `${date}-${lastInMonth}`;
};

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
  state = store.getState()
): Record<typeof mainPages[number], boolean> => {
  const linkedFavorites = selectLinkedFavorites(state);

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

export const filterData = (state = store.getState()) => {
  const page = selectPage(state);
  const sets = selectAllSets(state);
  const search = selectSearch(state);
  const whitelist = selectWhitelist(state);
  const favorites = selectFavorites(state);
  const bought = selectBought(state);
  const hidden = selectHidden(state);
  const user = selectUser(state);
  const initialLoad = selectInitialLoad(state);

  if (initialLoad) {
    return;
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
      return pageConditions(set, favorites, bought, hidden)[page];
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

  const filteredSets = sets.filter(
    (set) =>
      hiddenBool(set) && pageBool(set) && filterBool(set) && searchBool(set)
  );

  dispatch(setFilteredSets(filteredSets.map(({ id }) => id)));

  dispatch(setLoading(false));
};

export const setWhitelistMerge = (
  partialWhitelist: Partial<WhitelistType>,
  clearUrl = true,
  state = store.getState()
) => {
  const setTotal = selectSetTotal(state);
  dispatch(mergeWhitelist(partialWhitelist));
  document.documentElement.scrollTop = 0;
  if (setTotal > 0) {
    filterData();
  }
  if (clearUrl) {
    dispatch(setURLWhitelist({}));
    const params = new URLSearchParams(window.location.search);
    if (whitelistParams.some((param) => params.has(param))) {
      const newUrl = createURL({}, (params) => {
        whitelistParams.forEach((param) => params.delete(param));
      });
      window.history.pushState({}, "KeycapLendar", newUrl);
    }
  }
};

export const setWhitelist = <T extends keyof WhitelistType>(
  prop: T,
  val: WhitelistType[T],
  clearUrl = true,
  state = store.getState()
) => {
  const mainWhitelist = selectWhitelist(state);
  const setTotal = selectSetTotal(state);
  if (is<string[]>(mainWhitelist.edited)) {
    dispatch(mergeWhitelist({ [prop]: val }));
    document.documentElement.scrollTop = 0;
    if (setTotal > 0) {
      filterData();
    }
  }
  if (clearUrl) {
    dispatch(setURLWhitelist({}));
    const params = new URLSearchParams(window.location.search);
    if (whitelistParams.some((param) => params.has(param))) {
      const newUrl = createURL({}, (params) => {
        whitelistParams.forEach((param) => params.delete(param));
      });
      window.history.pushState({}, "KeycapLendar", newUrl);
    }
  }
};

const applyInitialPreset = (): AppThunk<void> => (dispatch, getState) => {
  const state = getState();
  const defaultPreset = selectDefaultPreset(state);
  const currentPreset = selectCurrentPreset(state);
  const urlWhitelist = selectURLWhitelist(state);

  const params = new URLSearchParams(window.location.search);
  const noUrlParams =
    !whitelistParams.some((param) => params.has(param)) &&
    Object.keys(urlWhitelist).length === 0;
  if (!currentPreset.name && noUrlParams) {
    dispatch(setCurrentPreset("default"));
    setWhitelistMerge(defaultPreset.whitelist);
  } else if (!currentPreset.name && !noUrlParams) {
    const urlParams = [
      ...whitelistParams.filter((param) => params.has(param)),
      ...Object.keys(urlWhitelist),
    ];
    dispatch(setCurrentPreset("default"));
    const partialWhitelist: Partial<WhitelistType> = {};
    const defaultParams = ["profiles", "regions"] as const;
    defaultParams.forEach((param) => {
      if (!urlParams.includes(param)) {
        ({
          whitelist: { [param]: partialWhitelist[param] },
        } = defaultPreset);
      }
    });
    setWhitelistMerge(partialWhitelist, false);
  }
};

export const getData = (): AppThunk<void> => (dispatch) => {
  dispatch(setLoading(true));
  firestore
    .collection("keysets")
    .get()
    .then((querySnapshot) => {
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

      dispatch([setAllSets(sets), setInitialLoad(false)]);

      filterData();
      dispatch(applyInitialPreset());
    })
    .catch((error) => {
      console.log(`Error getting data: ${error}`);
      queue.notify({ title: `Error getting data: ${error}` });
      dispatch(setLoading(false));
    });
};

export const testSets = (): AppThunk<void> => (dispatch, getState) => {
  const sets = selectAllSets(getState());
  const testValue = (set: SetType, key: string, value?: string) => {
    if (value) {
      const endSpace = /\s+$/m;
      const startSpace = /^\s+/;
      const commaNoSpace = /,[^ ]/;
      const stringInvalid =
        endSpace.test(value) ||
        startSpace.test(value) ||
        commaNoSpace.test(value);
      if (stringInvalid) {
        console.log(
          `${set.profile} ${set.colorway} - ${key}: ${value
            .replace(endSpace, "<space>")
            .replace(startSpace, "<space>")
            .replace(commaNoSpace, ",<no space>")}}`
        );
      }
    }
  };
  for (const set of sets) {
    for (const [key, value] of objectEntries(set)) {
      if (is<string>(value)) {
        testValue(set, key, value);
      } else if (is<any[]>(value)) {
        for (const item of value) {
          if (is<string>(item)) {
            testValue(set, key, item);
          } else if (is<VendorType>(item)) {
            for (const itemEntries of objectEntries(item)) {
              if (itemEntries) {
                const [itemKey, itemVal] = itemEntries;
                if (itemKey === "region") {
                  itemVal?.split(", ").forEach((region) => {
                    if (!region) {
                      console.log(
                        `${set.profile} ${set.colorway}: ${item.name} <empty region>`
                      );
                    }
                    testValue(set, `${key} ${itemKey}`, region);
                  });
                } else if (is<string>(itemVal)) {
                  testValue(set, `${key} ${itemKey}`, itemVal);
                }
              }
            }
          }
        }
      }
    }
  }
};

export const setSort = (
  sort: SortType,
  clearUrl = true,
  state = store.getState()
) => {
  const page = selectPage(state);
  document.documentElement.scrollTop = 0;
  let sortOrder: SortOrderType = "ascending";
  if (arrayIncludes(dateSorts, sort) && reverseSortDatePages.includes(page)) {
    sortOrder = "descending";
  }
  if (arrayIncludes(allSorts, sort)) {
    dispatch([setMainSort(sort), setMainSortOrder(sortOrder)]);
  }
  if (clearUrl) {
    const params = new URLSearchParams(window.location.search);
    if (params.has("sort")) {
      const newUrl = createURL({}, (params) => {
        params.delete("sort");
      });
      window.history.pushState({}, "KeycapLendar", newUrl);
    }
  }
};

export const setSortOrder = (sortOrder: SortOrderType, clearUrl = true) => {
  document.documentElement.scrollTop = 0;
  dispatch(setMainSortOrder(sortOrder));
  if (clearUrl) {
    const params = new URLSearchParams(window.location.search);
    if (params.has("sortOrder")) {
      const newUrl = createURL({}, (params) => {
        params.delete("sortOrder");
      });
      window.history.pushState({}, "KeycapLendar", newUrl);
    }
  }
};

export const setSearch =
  (query: string): AppThunk<void> =>
  (dispatch) => {
    dispatch(setMainSearch(query));
    filterData();
  };

export const updatePreset = (
  preset: OldPresetType | PresetType,
  state = store.getState()
): PresetType => {
  const allRegions = selectAllRegions(state);
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

export const selectPreset = (id: string, state = store.getState()) => {
  const preset = selectPresetById(state, id);
  if (preset) {
    dispatch(setCurrentPreset(preset.id));
    setWhitelistMerge(preset.whitelist);
  }
};

export const syncPresets = (state = store.getState()) => {
  const presets = selectAllUserPresets(state);
  const user = selectUser(state);
  firestore
    .collection("users")
    .doc(user.id as UserId)
    .set({ filterPresets: presets }, { merge: true })
    .catch((error) => {
      console.log(`Failed to sync presets: ${error}`);
      queue.notify({ title: `Failed to sync presets: ${error}` });
    });
};

export const newPreset = (preset: PresetType) => {
  const newPreset = dispatch(addUserPreset(preset));
  dispatch(setCurrentPreset(newPreset.id));
  syncPresets(store.getState());
};

export const editPreset = (preset: PresetType) => {
  dispatch([setCurrentPreset(preset.id), upsertUserPreset(preset)]);
  syncPresets(store.getState());
};

export const deletePreset = (presetId: EntityId) => {
  dispatch([setCurrentPreset("default"), deleteUserPreset(presetId)]);
  syncPresets(store.getState());
};

export const syncGlobalPresets = (state = store.getState()) => {
  const presets = selectAllAppPresets(state);
  firestore
    .collection("app")
    .doc("globals")
    .set({ filterPresets: presets }, { merge: true })
    .catch((error) => {
      console.log(`Failed to sync presets: ${error}`);
      queue.notify({ title: `Failed to sync presets: ${error}` });
    });
};

export const newGlobalPreset = (preset: PresetType) => {
  const newPreset = dispatch(addAppPreset(preset));
  dispatch(setCurrentPreset(newPreset.id));
  syncGlobalPresets(store.getState());
};

export const editGlobalPreset = (preset: PresetType) => {
  dispatch([upsertAppPreset(preset), setCurrentPreset(preset.id)]);
  syncGlobalPresets(store.getState());
};

export const deleteGlobalPreset = (presetId: EntityId) => {
  dispatch([setCurrentPreset("default"), deleteAppPreset(presetId)]);
  syncGlobalPresets(store.getState());
};
