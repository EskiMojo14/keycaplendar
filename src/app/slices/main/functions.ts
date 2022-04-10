import type { EntityId } from "@reduxjs/toolkit";
import { DateTime } from "luxon";
import { is } from "typescript-is";
import { queue } from "~/app/snackbar-queue";
import store from "~/app/store";
import type { AppThunk } from "~/app/store";
import { selectPage } from "@s/common";
import firestore from "@s/firebase/firestore";
import type { UserId } from "@s/firebase/types";
import {
  addUserPreset,
  deleteUserPreset,
  selectAllUserPresets,
  selectUser,
  upsertUserPreset,
} from "@s/user";
import { arrayIncludes, createURL, objectEntries } from "@s/util/functions";
import {
  addAppPreset,
  deleteAppPreset,
  mergeWhitelist,
  selectAllAppPresets,
  selectAllRegions,
  selectAllSets,
  selectCurrentPreset,
  selectDefaultPreset,
  selectPresetById,
  selectURLWhitelist,
  selectWhitelist,
  setAllSets,
  setCurrentPreset,
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

export const setWhitelistMerge = (
  partialWhitelist: Partial<WhitelistType>,
  clearUrl = true
) => {
  dispatch(mergeWhitelist(partialWhitelist));
  document.documentElement.scrollTop = 0;
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
  if (is<string[]>(mainWhitelist.edited)) {
    dispatch(mergeWhitelist({ [prop]: val }));
    document.documentElement.scrollTop = 0;
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

      dispatch([setAllSets(sets), setInitialLoad(false), setLoading(false)]);

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
