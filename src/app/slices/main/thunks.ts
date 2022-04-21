import type { EntityId } from "@reduxjs/toolkit";
import { nanoid } from "nanoid";
import { is } from "typescript-is";
import { history } from "~/app/history";
import { notify } from "~/app/snackbar-queue";
import type { AppThunk } from "~/app/store";
import type { MainPage } from "@s/common/types";
import firestore from "@s/firebase/firestore";
import type { UserId } from "@s/firebase/types";
import {
  addAppPreset as _addAppPreset,
  setSearch as _setSearch,
  setSort as _setSort,
  setSortOrder as _setSortOrder,
  deleteAppPreset,
  mergeWhitelist,
  selectAllAppPresets,
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
  setURLWhitelist,
  upsertAppPreset,
} from "@s/main";
import {
  allSorts,
  dateSorts,
  reverseSortDatePages,
  whitelistParams,
} from "@s/main/constants";
import { addLastDate } from "@s/main/functions";
import { getPageName, push } from "@s/router";
import {
  deleteUserPreset,
  selectAllUserPresets,
  selectUser,
  upsertUserPreset,
} from "@s/user";
import { addUserPreset } from "@s/user/thunks";
import { arrayIncludes, createURL, objectEntries } from "@s/util/functions";
import type { Overwrite } from "@s/util/types";
import type {
  PresetType,
  SetType,
  SortOrderType,
  SortType,
  VendorType,
  WhitelistType,
} from "./types";

export const setWhitelistMerge =
  (partialWhitelist: Partial<WhitelistType>, clearUrl = true): AppThunk<void> =>
  (dispatch) => {
    dispatch(mergeWhitelist(partialWhitelist));
    document.documentElement.scrollTop = 0;
    if (clearUrl) {
      dispatch(setURLWhitelist({}));
      const params = new URLSearchParams(window.location.search);
      if (whitelistParams.some((param) => params.has(param))) {
        const newUrl = createURL(
          {},
          (params) => {
            whitelistParams.forEach((param) => params.delete(param));
          },
          true
        );
        dispatch(push(newUrl));
      }
    }
  };

export const setWhitelist =
  <T extends keyof WhitelistType>(
    prop: T,
    val: WhitelistType[T],
    clearUrl = true
  ): AppThunk<void> =>
  (dispatch, getState) => {
    const mainWhitelist = selectWhitelist(getState());
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
        dispatch(push(newUrl));
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
    dispatch(setWhitelistMerge(defaultPreset.whitelist));
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
    dispatch(setWhitelistMerge(partialWhitelist, false));
  }
};

export const getData = (): AppThunk<Promise<void>> => async (dispatch) => {
  dispatch(setLoading(true));
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

    dispatch([setAllSets(sets), setInitialLoad(false), setLoading(false)]);

    dispatch(applyInitialPreset());
  } catch (error) {
    console.log(`Error getting data: ${error}`);
    notify({ title: `Error getting data: ${error}` });
    dispatch(setLoading(false));
  }
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

export const setSort =
  (sort: SortType, clearUrl = true): AppThunk<void> =>
  (dispatch) => {
    const page = getPageName(history.location.pathname) as MainPage;
    document.documentElement.scrollTop = 0;
    let sortOrder: SortOrderType = "ascending";
    if (
      arrayIncludes(dateSorts, sort) &&
      arrayIncludes(reverseSortDatePages, page)
    ) {
      sortOrder = "descending";
    }
    if (arrayIncludes(allSorts, sort)) {
      dispatch([_setSort(page, sort), _setSortOrder(page, sortOrder)]);
    }
    if (clearUrl) {
      const params = new URLSearchParams(window.location.search);
      if (params.has("sort")) {
        const newUrl = createURL(
          {},
          (params) => {
            params.delete("sort");
          },
          true
        );
        dispatch(push(newUrl));
      }
    }
  };

export const setSortOrder =
  (sortOrder: SortOrderType, clearUrl = true): AppThunk<void> =>
  (dispatch) => {
    const page = getPageName(history.location.pathname) as MainPage;
    document.documentElement.scrollTop = 0;
    dispatch(_setSortOrder(page, sortOrder));
    if (clearUrl) {
      const params = new URLSearchParams(window.location.search);
      if (params.has("sortOrder")) {
        const newUrl = createURL(
          {},
          (params) => {
            params.delete("sortOrder");
          },
          true
        );
        dispatch(push(newUrl));
      }
    }
  };

export const setSearch =
  (query: string): AppThunk<void> =>
  (dispatch) => {
    dispatch(_setSearch(query));
  };

export const addAppPreset =
  (userPreset: Overwrite<PresetType, { id?: string }>): AppThunk<PresetType> =>
  (dispatch) => {
    const preset: PresetType = { ...userPreset, id: userPreset.id ?? nanoid() };
    dispatch(_addAppPreset(preset));
    return preset;
  };

export const selectPreset =
  (id: string): AppThunk<void> =>
  (dispatch, getState) => {
    const preset = selectPresetById(getState(), id);
    if (preset) {
      dispatch(setCurrentPreset(preset.id));
      dispatch(setWhitelistMerge(preset.whitelist));
    }
  };

export const syncPresets =
  (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const state = getState();
    const presets = selectAllUserPresets(state);
    const user = selectUser(state);
    try {
      await firestore
        .collection("users")
        .doc(user.id as UserId)
        .set({ filterPresets: presets }, { merge: true });
    } catch (error) {
      console.log(`Failed to sync presets: ${error}`);
      notify({ title: `Failed to sync presets: ${error}` });
    }
  };

export const newPreset =
  (preset: PresetType): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const newPreset = dispatch(addUserPreset(preset));
    dispatch(setCurrentPreset(newPreset.id));
    await dispatch(syncPresets());
  };

export const editPreset =
  (preset: PresetType): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch([setCurrentPreset(preset.id), upsertUserPreset(preset)]);
    await dispatch(syncPresets());
  };

export const deletePreset =
  (presetId: EntityId): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch([setCurrentPreset("default"), deleteUserPreset(presetId)]);
    await dispatch(syncPresets());
  };

export const syncGlobalPresets =
  (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const presets = selectAllAppPresets(getState());
    try {
      await firestore
        .collection("app")
        .doc("globals")
        .set({ filterPresets: presets }, { merge: true });
    } catch (error) {
      console.log(`Failed to sync presets: ${error}`);
      notify({ title: `Failed to sync presets: ${error}` });
    }
  };

export const newGlobalPreset =
  (preset: PresetType): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const newPreset = dispatch(addAppPreset(preset));
    dispatch(setCurrentPreset(newPreset.id));
    await dispatch(syncGlobalPresets());
  };

export const editGlobalPreset =
  (preset: PresetType): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch([upsertAppPreset(preset), setCurrentPreset(preset.id)]);
    await dispatch(syncGlobalPresets());
  };

export const deleteGlobalPreset =
  (presetId: EntityId): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch([setCurrentPreset("default"), deleteAppPreset(presetId)]);
    await dispatch(syncGlobalPresets());
  };
