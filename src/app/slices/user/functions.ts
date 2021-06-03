import { typedFirestore } from "../firebase/firestore";
import { queue } from "../../snackbarQueue";
import store from "../../store";
import { addOrRemove, hasKey } from "../common/functions";
import { UserId } from "../firebase/types";
import { whitelistParams } from "../main/constants";
import { filterData, selectPreset, updatePreset } from "../main/functions";
import { getStorage, setSyncSettings, settingFns } from "../settings/functions";
import { setBought, setFavorites, setHidden, setUserPresets } from "./userSlice";

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
            const { favorites, bought, hidden, settings: settingsPrefs, syncSettings, filterPresets } = data;

            filterData(page, allSets, sort, sortOrder, search, whitelist, favorites, hidden);

            if (favorites instanceof Array) {
              dispatch(setFavorites(favorites));
            }
            if (bought instanceof Array) {
              dispatch(setBought(bought));
            }
            if (hidden instanceof Array) {
              dispatch(setHidden(hidden));
            }

            if (filterPresets) {
              const updatedPresets = filterPresets.map((preset) => updatePreset(preset));
              dispatch(setUserPresets(updatedPresets));
              const storedPreset = getStorage("presetId");
              const params = new URLSearchParams(window.location.search);
              const noUrlParams = !whitelistParams.some((param) => params.has(param));
              if (storedPreset && storedPreset !== "default" && noUrlParams) {
                selectPreset(storedPreset, false);
              }
            }

            if (typeof syncSettings === "boolean") {
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
