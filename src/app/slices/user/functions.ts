import firebase from "@s/firebase/firebase";
import { typedFirestore } from "@s/firebase/firestore";
import { is } from "typescript-is";
import debounce from "lodash.debounce";
import { queue } from "~/app/snackbarQueue";
import store from "~/app/store";
import { UserId } from "@s/firebase/types";
import { addOrRemove, hasKey } from "@s/common/functions";
import { setLinkedFavorites } from "@s/main/mainSlice";
import { whitelistParams } from "@s/main/constants";
import { filterData, selectPreset, updatePreset } from "@s/main/functions";
import { getStorage, setSyncSettings, settingFns } from "@s/settings/functions";
import { setBought, setFavorites, setFavoritesId, setHidden, setShareName, setUserPresets } from "./userSlice";
import { setShareNameLoading } from "@s/settings/settingsSlice";

const { dispatch } = store;

export const getUserPreferences = (id: string) => {
  if (id) {
    typedFirestore
      .collection("users")
      .doc(id as UserId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const {
            common: { page },
            main: { allSets, sort, sortOrder, search, whitelist },
            settings,
          } = store.getState();
          const data = doc.data();
          if (data) {
            const {
              favorites,
              favoritesId,
              bought,
              hidden,
              settings: settingsPrefs,
              syncSettings,
              filterPresets,
              shareName,
            } = data;

            filterData(page, allSets, sort, sortOrder, search, whitelist, favorites, bought, hidden);

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
              const updatedPresets = filterPresets.map((preset) => updatePreset(preset));
              dispatch(setUserPresets(updatedPresets));
              const storedPreset = getStorage("presetId");
              const {
                main: { urlWhitelist },
              } = store.getState();
              const params = new URLSearchParams(window.location.search);
              const noUrlParams =
                !whitelistParams.some((param) => params.has(param)) && Object.keys(urlWhitelist).length === 0;
              if (storedPreset && storedPreset !== "default" && noUrlParams) {
                selectPreset(storedPreset, false);
              }
            }

            if (is<boolean>(syncSettings)) {
              if (syncSettings !== settings.syncSettings) {
                setSyncSettings(syncSettings, false);
              }
              if (syncSettings) {
                const getSetting = (setting: string, setFunction: (val: any, write: boolean) => void) => {
                  if (settingsPrefs && hasKey(settingsPrefs, setting)) {
                    if (settingsPrefs[setting] !== settings[setting]) {
                      setFunction(settingsPrefs[setting], false);
                    }
                  }
                };
                Object.keys(settingFns).forEach((setting) => {
                  if (hasKey(settingFns, setting)) {
                    const func = settingFns[setting];
                    getSetting(setting, func);
                  }
                });
              }
            }
          }
        }
      })
      .catch((error) => {
        console.log("Failed to get user preferences: " + error);
        queue.notify({ title: "Failed to get user preferences: " + error });
      });
  }
};

export const toggleFavorite = (id: string) => {
  const {
    common: { page },
    main: { allSets, sort, sortOrder, search, whitelist },
    user: { user, favorites: userFavorites },
  } = store.getState();
  const favorites = addOrRemove([...userFavorites], id);
  dispatch(setFavorites(favorites));
  if (page === "favorites" || whitelist.favorites) {
    filterData(page, allSets, sort, sortOrder, search, whitelist, favorites);
  }
  if (user.id) {
    typedFirestore
      .collection("users")
      .doc(user.id as UserId)
      .set(
        {
          favorites: favorites,
        },
        { merge: true }
      )
      .catch((error) => {
        console.log("Failed to sync favorites: " + error);
        queue.notify({ title: "Failed to sync favorites: " + error });
      });
  }
};

export const toggleBought = (id: string) => {
  const {
    common: { page },
    main: { allSets, sort, sortOrder, search, whitelist },
    user: { user, favorites, bought: userBought },
  } = store.getState();
  const bought = addOrRemove([...userBought], id);
  dispatch(setBought(bought));
  if (page === "bought" || whitelist.bought) {
    filterData(page, allSets, sort, sortOrder, search, whitelist, favorites, bought);
  }
  if (user.id) {
    typedFirestore
      .collection("users")
      .doc(user.id as UserId)
      .set(
        {
          bought: bought,
        },
        { merge: true }
      )
      .catch((error) => {
        console.log("Failed to sync bought sets: " + error);
        queue.notify({ title: "Failed to sync bought sets: " + error });
      });
  }
};

export const toggleHidden = (id: string) => {
  const {
    common: { page },
    main: { allSets, sort, sortOrder, search, whitelist },
    user: { user, favorites: userFavorites, bought: userBought, hidden: userHidden },
  } = store.getState();
  const hidden = addOrRemove([...userHidden], id);
  dispatch(setHidden(hidden));
  if (page !== "favorites" && page !== "bought") {
    filterData(page, allSets, sort, sortOrder, search, whitelist, userFavorites, userBought, hidden);
  }
  const isHidden = hidden.includes(id);
  queue.notify({
    title: `Set ${isHidden ? "hidden" : "unhidden"}.`,
    actions: [
      {
        label: "Undo",
        onClick: () => {
          toggleHidden(id);
        },
      },
    ],
    timeout: 2500,
    dismissesOnAction: true,
  });
  if (user.id) {
    typedFirestore
      .collection("users")
      .doc(user.id as UserId)
      .set(
        {
          hidden: hidden,
        },
        { merge: true }
      )
      .catch((error) => {
        console.log("Failed to sync hidden sets: " + error);
        queue.notify({ title: "Failed to sync hidden sets: " + error });
      });
  }
};

export const syncShareName = (shareName: string) => {
  const {
    user: { user },
  } = store.getState();
  dispatch(setShareNameLoading(true));
  typedFirestore
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
      console.log("Failed to sync display name: " + error);
      queue.notify({ title: "Failed to sync display name: " + error });
    });
};

export const debouncedSyncShareName = debounce(syncShareName, 1000, { trailing: true });

export const syncFavoritesId = (id: string) => {
  const {
    user: { user },
  } = store.getState();
  typedFirestore
    .collection("users")
    .doc(user.id as UserId)
    .set(
      {
        favoritesId: id ? id : firebase.firestore.FieldValue.delete(),
      },
      { merge: true }
    )
    .catch((error) => {
      console.log("Failed to sync favorites ID: " + error);
      queue.notify({ title: "Failed to sync favorites ID: " + error });
    });
};

export const debouncedSyncFavoritesId = debounce(syncFavoritesId, 1000, { trailing: true });

export const getLinkedFavorites = (id: string) => {
  const cloudFn = firebase.functions().httpsCallable("getFavorites");
  cloudFn({ id })
    .then((result) => {
      const data = result.data;
      if (hasKey(data, "array") && is<string[]>(data.array)) {
        dispatch(setLinkedFavorites(data));
        filterData();
      }
    })
    .catch((error) => {
      console.log(error);
      queue.notify({ title: "Failed to get linked favorites: " + error });
    });
};
