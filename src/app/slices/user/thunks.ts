import type { AnyAction, EntityId } from "@reduxjs/toolkit";
import debounce from "lodash.debounce";
import { is } from "typescript-is";
import { queue } from "~/app/snackbar-queue";
import type { AppDispatch, AppThunk, BatchTuple } from "~/app/store";
import firebase from "@s/firebase";
import firestore from "@s/firebase/firestore";
import type { UserId } from "@s/firebase/types";
import { setLinkedFavorites } from "@s/main";
import { updatePreset } from "@s/main/thunks";
import { setShareNameLoading } from "@s/settings";
import { setSyncSettings, settingFns } from "@s/settings/thunks";
import {
  selectBought,
  selectFavorites,
  selectHidden,
  selectUser,
  setBought,
  setFavorites,
  setFavoritesId,
  setHidden,
  setShareName,
  setUserPresets,
} from "@s/user";
import { addOrRemove, hasKey } from "@s/util/functions";

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
              actions.push(setShareName(shareName));
            }

            if (favoritesId) {
              actions.push(setFavoritesId(favoritesId));
            }

            if (is<string[]>(favorites)) {
              actions.push(setFavorites(favorites));
            }
            if (is<string[]>(bought)) {
              actions.push(setBought(bought));
            }
            if (is<string[]>(hidden)) {
              actions.push(setHidden(hidden));
            }

            if (filterPresets) {
              const updatedPresets = filterPresets.map((preset) =>
                dispatch(updatePreset(preset))
              );
              actions.push(setUserPresets(updatedPresets));
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
        queue.notify({ title: `Failed to get user preferences: ${error}` });
      }
    }
  };

export const toggleFavorite =
  (id: EntityId): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const state = getState();
    const user = selectUser(state);
    const userFavorites = selectFavorites(state);
    const favorites = addOrRemove([...userFavorites], id);
    dispatch(setFavorites(favorites));
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
        queue.notify({ title: `Failed to sync favorites: ${error}` });
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
    dispatch(setBought(bought));
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
        queue.notify({ title: `Failed to sync bought sets: ${error}` });
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
    dispatch(setHidden(hidden));
    const isHidden = hidden.includes(id);
    queue.notify({
      actions: [
        {
          label: "Undo",
          onClick: () => {
            toggleHidden(id);
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
        queue.notify({ title: `Failed to sync hidden sets: ${error}` });
      }
    }
  };

export const syncShareName =
  (shareName: string): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const state = getState();
    const user = selectUser(state);
    dispatch(setShareNameLoading(true));
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
      dispatch(setShareNameLoading(false));
    } catch (error) {
      console.log(`Failed to sync display name: ${error}`);
      queue.notify({ title: `Failed to sync display name: ${error}` });
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
      queue.notify({ title: `Failed to sync favorites ID: ${error}` });
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
      const { data } = await cloudFn({ id });
      if (hasKey(data, "array") && is<string[]>(data.array)) {
        dispatch(setLinkedFavorites(data));
      }
    } catch (error) {
      console.log(error);
      queue.notify({ title: `Failed to get linked favorites: ${error}` });
    }
  };
