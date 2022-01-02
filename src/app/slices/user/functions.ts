import debounce from "lodash.debounce";
import { is } from "typescript-is";
import { queue } from "~/app/snackbar-queue";
import store from "~/app/store";
import { selectPage } from "@s/common";
import firebase from "@s/firebase";
import firestore from "@s/firebase/firestore";
import type { UserId } from "@s/firebase/types";
import { selectWhitelist, setLinkedFavorites } from "@s/main";
import { filterData, updatePreset } from "@s/main/functions";
import { setShareNameLoading } from "@s/settings";
import { setSyncSettings, settingFns } from "@s/settings/functions";
import { addOrRemove, hasKey } from "@s/util/functions";
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
} from ".";

const { dispatch } = store;

export const getUserPreferences = (id: string) => {
  if (id) {
    firestore
      .collection("users")
      .doc(id as UserId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const { settings } = store.getState();
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

            if (shareName) {
              dispatch(setShareName(shareName));
            }

            if (favoritesId) {
              dispatch(setFavoritesId(favoritesId));
            }

            if (is<string[]>(favorites)) {
              dispatch(setFavorites(favorites));
            }
            if (is<string[]>(bought)) {
              dispatch(setBought(bought));
            }
            if (is<string[]>(hidden)) {
              dispatch(setHidden(hidden));
            }

            if (filterPresets) {
              const updatedPresets = filterPresets.map((preset) =>
                updatePreset(preset)
              );
              dispatch(setUserPresets(updatedPresets));
            }

            if (is<boolean>(syncSettings)) {
              if (syncSettings !== settings.syncSettings) {
                setSyncSettings(syncSettings, false);
              }
              if (syncSettings) {
                const getSetting = (
                  setting: string,
                  setFunction: (val: any, write: boolean) => void
                ) => {
                  if (settingsPrefs && hasKey(settingsPrefs, setting)) {
                    if (settingsPrefs[setting] !== settings[setting]) {
                      setFunction(settingsPrefs[setting], false);
                    }
                  }
                };
                Object.keys(settingFns).forEach((setting) => {
                  if (hasKey(settingFns, setting)) {
                    const { [setting]: func } = settingFns;
                    getSetting(setting, func);
                  }
                });
              }
            }

            filterData();
          }
        }
      })
      .catch((error) => {
        console.log(`Failed to get user preferences: ${error}`);
        queue.notify({ title: `Failed to get user preferences: ${error}` });
      });
  }
};

export const toggleFavorite = (id: string, state = store.getState()) => {
  const page = selectPage(state);
  const whitelist = selectWhitelist(state);
  const user = selectUser(state);
  const userFavorites = selectFavorites(state);
  const favorites = addOrRemove([...userFavorites], id);
  dispatch(setFavorites(favorites));
  if (page === "favorites" || whitelist.favorites) {
    filterData();
  }
  if (user.id) {
    firestore
      .collection("users")
      .doc(user.id as UserId)
      .set(
        {
          favorites,
        },
        { merge: true }
      )
      .catch((error) => {
        console.log(`Failed to sync favorites: ${error}`);
        queue.notify({ title: `Failed to sync favorites: ${error}` });
      });
  }
};

export const toggleBought = (id: string, state = store.getState()) => {
  const page = selectPage(state);
  const whitelist = selectWhitelist(state);
  const user = selectUser(state);
  const userBought = selectBought(state);
  const bought = addOrRemove([...userBought], id);
  dispatch(setBought(bought));
  if (page === "bought" || whitelist.bought) {
    filterData();
  }
  if (user.id) {
    firestore
      .collection("users")
      .doc(user.id as UserId)
      .set(
        {
          bought,
        },
        { merge: true }
      )
      .catch((error) => {
        console.log(`Failed to sync bought sets: ${error}`);
        queue.notify({ title: `Failed to sync bought sets: ${error}` });
      });
  }
};

export const toggleHidden = (id: string, state = store.getState()) => {
  const page = selectPage(state);
  const user = selectUser(state);
  const userHidden = selectHidden(state);
  const hidden = addOrRemove([...userHidden], id);
  dispatch(setHidden(hidden));
  if (page !== "favorites" && page !== "bought") {
    filterData();
  }
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
    firestore
      .collection("users")
      .doc(user.id as UserId)
      .set(
        {
          hidden,
        },
        { merge: true }
      )
      .catch((error) => {
        console.log(`Failed to sync hidden sets: ${error}`);
        queue.notify({ title: `Failed to sync hidden sets: ${error}` });
      });
  }
};

export const syncShareName = (shareName: string, state = store.getState()) => {
  const user = selectUser(state);
  dispatch(setShareNameLoading(true));
  firestore
    .collection("users")
    .doc(user.id as UserId)
    .set(
      {
        shareName,
      },
      { merge: true }
    )
    .then(() => {
      dispatch(setShareNameLoading(false));
    })
    .catch((error) => {
      console.log(`Failed to sync display name: ${error}`);
      queue.notify({ title: `Failed to sync display name: ${error}` });
    });
};

export const debouncedSyncShareName = debounce(syncShareName, 1000, {
  trailing: true,
});

export const syncFavoritesId = (id: string, state = store.getState()) => {
  const user = selectUser(state);
  firestore
    .collection("users")
    .doc(user.id as UserId)
    .set(
      {
        favoritesId: id ?? firebase.firestore.FieldValue.delete(),
      },
      { merge: true }
    )
    .catch((error) => {
      console.log(`Failed to sync favorites ID: ${error}`);
      queue.notify({ title: `Failed to sync favorites ID: ${error}` });
    });
};

export const debouncedSyncFavoritesId = debounce(syncFavoritesId, 1000, {
  trailing: true,
});

export const getLinkedFavorites = (id: string) => {
  const cloudFn = firebase.functions().httpsCallable("getFavorites");
  cloudFn({ id })
    .then(({ data }) => {
      if (hasKey(data, "array") && is<string[]>(data.array)) {
        dispatch(setLinkedFavorites(data));
        filterData();
      }
    })
    .catch((error) => {
      console.log(error);
      queue.notify({ title: `Failed to get linked favorites: ${error}` });
    });
};
