import firebase from "../../../firebase";
import { queue } from "../../snackbarQueue";
import store from "../../store";
import { addOrRemove, hasKey } from "../common/functions";
import { whitelistParams } from "../main/constants";
import { filterData, selectPreset, updatePreset } from "../main/functions";
import { getStorage, setSyncSettings, settingFns } from "../settings/functions";
import { UserPreferencesDoc } from "./types";
import { setFavorites, setHidden, setUserPresets } from "./userSlice";

const db = firebase.firestore();

const { dispatch } = store;

export const getUserPreferences = (id: string) => {
  if (id) {
    const {
      common: { page },
      main: { allSets, sort, sortOrder, search, whitelist },
      settings,
    } = store.getState();
    db.collection("users")
      .doc(id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          const {
            favorites,
            hidden,
            settings: settingsPrefs,
            syncSettings,
            filterPresets,
          } = data as UserPreferencesDoc;

          if (favorites instanceof Array) {
            dispatch(setFavorites(favorites));
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

          filterData(page, allSets, sort, sortOrder, search, whitelist, favorites, hidden);
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
  if (page === "favorites") {
    filterData(page, allSets, sort, sortOrder, search, whitelist, favorites);
  }
  if (user.id) {
    db.collection("users")
      .doc(user.id)
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
export const toggleHidden = (id: string) => {
  const {
    common: { page },
    main: { allSets, sort, sortOrder, search, whitelist },
    user: { user, favorites: userFavorites, hidden: userHidden },
  } = store.getState();
  const hidden = addOrRemove([...userHidden], id);
  dispatch(setHidden(hidden));
  filterData(page, allSets, sort, sortOrder, search, whitelist, userFavorites, hidden);
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
    db.collection("users")
      .doc(user.id)
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
