import type { AnyAction, EntityId } from "@reduxjs/toolkit";
import debounce from "lodash.debounce";
import { nanoid } from "nanoid";
import { is } from "typescript-is";
import { notify } from "~/app/snackbar-queue";
import type { AppDispatch, AppThunk, BatchTuple } from "~/app/store";
import firebase from "@s/firebase";
import firestore from "@s/firebase/firestore";
import type { UserId } from "@s/firebase/types";
import {
  setCurrentPreset,
  setLinkedFavorites,
  setLinkedFavoritesLoading,
  updatePreset,
} from "@s/main";
import { testSets } from "@s/main/thunks";
import type { PresetType } from "@s/main/types";
import { shareNameLoad } from "@s/settings";
import { setSyncSettings, settingFns } from "@s/settings/thunks";
import {
  boughtChange,
  favoritesChange,
  favoritesIdChange,
  hiddenChange,
  selectBought,
  selectFavorites,
  selectHidden,
  selectUser,
  shareNameChange,
  userLogin,
  userPresetAdded,
  userPresetsLoaded,
  userReset,
} from "@s/user";
import { addOrRemove, hasKey } from "@s/util/functions";
import type { Overwrite } from "@s/util/types";

export const addUserPreset =
  (userPreset: Overwrite<PresetType, { id?: string }>): AppThunk<PresetType> =>
  (dispatch) => {
    const preset: PresetType = { ...userPreset, id: userPreset.id ?? nanoid() };
    dispatch(userPresetAdded(preset));
    return preset;
  };

export const getUserPreferences =
  (id: string): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    if (id) {
      try {
        const doc = await firestore
          .collection("users")
          .doc(id as UserId)
          .get();
        if (doc.exists) {
          const { settings } = getState();
          const data = doc.data();
          if (data) {
            const {
              bought,
              favorites,
              favoritesId,
              filterPresets,
              hidden,
              settings: settingsPrefs,
              shareName,
              syncSettings,
            } = data;

            const actions: AnyAction[] = [];

            if (shareName) {
              actions.push(shareNameChange(shareName));
            }

            if (favoritesId) {
              actions.push(favoritesIdChange(favoritesId));
            }

            if (is<string[]>(favorites)) {
              actions.push(favoritesChange(favorites));
            }
            if (is<string[]>(bought)) {
              actions.push(boughtChange(bought));
            }
            if (is<string[]>(hidden)) {
              actions.push(hiddenChange(hidden));
            }

            if (filterPresets) {
              const updatedPresets = filterPresets.map((preset) =>
                dispatch(updatePreset(preset))
              );
              actions.push(userPresetsLoaded(updatedPresets));
            }

            if (is<boolean>(syncSettings)) {
              if (syncSettings !== settings.syncSettings) {
                dispatch(setSyncSettings(syncSettings, false));
              }
              if (syncSettings) {
                const getSetting = (
                  setting: string,
                  setFunction: (val: any, write: boolean) => AppThunk<void>
                ) => {
                  if (settingsPrefs && hasKey(settingsPrefs, setting)) {
                    if (settingsPrefs[setting] !== settings[setting]) {
                      dispatch(setFunction(settingsPrefs[setting], false));
                    }
                  }
                };
                Object.entries(settingFns).forEach(([setting, func]) => {
                  getSetting(setting, func);
                });
              }
            }

            dispatch(actions as unknown as BatchTuple);
          }
        }
      } catch (error) {
        console.log(`Failed to get user preferences: ${error}`);
        notify({ title: `Failed to get user preferences: ${error}` });
      }
    }
  };

const getClaims = firebase.functions().httpsCallable("getClaims");
export const setupAuthListener =
  (): AppThunk<firebase.Unsubscribe> => (dispatch) =>
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const result = await getClaims();
          dispatch(
            userLogin({
              avatar: user.photoURL ?? "",
              email: user.email ?? "",
              id: user.uid,
              isAdmin: result.data.admin,
              isDesigner: result.data.designer,
              isEditor: result.data.editor,
              name: user.displayName ?? "",
              nickname: result.data.nickname,
            })
          );
          if (result.data.admin) {
            dispatch(testSets());
          }
        } catch (error) {
          notify({ title: `Error verifying custom claims: ${error}` });
          dispatch(
            userLogin({
              avatar: user.photoURL ?? "",
              email: user.email ?? "",
              id: user.uid,
              name: user.displayName ?? "",
            })
          );
        }
        dispatch(getUserPreferences(user.uid));
      } else {
        dispatch(userReset());
        dispatch(setCurrentPreset("default"));
      }
    });

export const toggleFavorite =
  (id: EntityId): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const state = getState();
    const user = selectUser(state);
    const userFavorites = selectFavorites(state);
    const favorites = addOrRemove([...userFavorites], id);
    dispatch(favoritesChange(favorites));
    if (user.id) {
      try {
        await firestore
          .collection("users")
          .doc(user.id as UserId)
          .set(
            {
              favorites,
            },
            { merge: true }
          );
      } catch (error) {
        console.log(`Failed to sync favorites: ${error}`);
        notify({ title: `Failed to sync favorites: ${error}` });
      }
    }
  };

export const toggleBought =
  (id: EntityId): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const state = getState();
    const user = selectUser(state);
    const userBought = selectBought(state);
    const bought = addOrRemove([...userBought], id);
    dispatch(boughtChange(bought));
    if (user.id) {
      try {
        await firestore
          .collection("users")
          .doc(user.id as UserId)
          .set(
            {
              bought,
            },
            { merge: true }
          );
      } catch (error) {
        console.log(`Failed to sync bought sets: ${error}`);
        notify({ title: `Failed to sync bought sets: ${error}` });
      }
    }
  };

export const toggleHidden =
  (id: EntityId): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const state = getState();
    const user = selectUser(state);
    const userHidden = selectHidden(state);
    const hidden = addOrRemove([...userHidden], id);
    dispatch(hiddenChange(hidden));
    const isHidden = hidden.includes(id);
    notify({
      actions: [
        {
          label: "Undo",
          onClick: () => {
            dispatch(toggleHidden(id));
          },
        },
      ],
      dismissesOnAction: true,
      timeout: 2500,
      title: `Set ${isHidden ? "hidden" : "unhidden"}.`,
    });
    if (user.id) {
      try {
        await firestore
          .collection("users")
          .doc(user.id as UserId)
          .set(
            {
              hidden,
            },
            { merge: true }
          );
      } catch (error) {
        console.log(`Failed to sync hidden sets: ${error}`);
        notify({ title: `Failed to sync hidden sets: ${error}` });
      }
    }
  };

export const syncShareName =
  (shareName: string): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const state = getState();
    const user = selectUser(state);
    dispatch(shareNameLoad(true));
    try {
      await firestore
        .collection("users")
        .doc(user.id as UserId)
        .set(
          {
            shareName,
          },
          { merge: true }
        );
      dispatch(shareNameLoad(false));
    } catch (error) {
      console.log(`Failed to sync display name: ${error}`);
      notify({ title: `Failed to sync display name: ${error}` });
    }
  };

export const createDebouncedSyncShareName = (dispatch: AppDispatch) =>
  debounce(
    (...args: Parameters<typeof syncShareName>) =>
      dispatch(syncShareName(...args)),
    1000,
    {
      trailing: true,
    }
  );

export const syncFavoritesId =
  (id: string): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const user = selectUser(getState());
    try {
      await firestore
        .collection("users")
        .doc(user.id as UserId)
        .set(
          {
            favoritesId: id ?? firebase.firestore.FieldValue.delete(),
          },
          { merge: true }
        );
    } catch (error) {
      console.log(`Failed to sync favorites ID: ${error}`);
      notify({ title: `Failed to sync favorites ID: ${error}` });
    }
  };

export const createDebouncedSyncFavoritesId = (dispatch: AppDispatch) =>
  debounce(
    (...args: Parameters<typeof syncFavoritesId>) =>
      dispatch(syncFavoritesId(...args)),
    1000,
    {
      trailing: true,
    }
  );

export const getLinkedFavorites =
  (id: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const cloudFn = firebase.functions().httpsCallable("getFavorites");
    try {
      dispatch(setLinkedFavoritesLoading(true));
      const { data } = await cloudFn({ id });
      if (hasKey(data, "array") && is<string[]>(data.array)) {
        dispatch([setLinkedFavorites(data), setLinkedFavoritesLoading(false)]);
      }
    } catch (error) {
      console.log(error);
      notify({ title: `Failed to get linked favorites: ${error}` });
    }
  };
