import { DateTime } from "luxon";
import { queue } from "~/app/snackbar-queue";
import type { AppThunk } from "~/app/store";
import { selectTheme, setTheme } from "@s/common";
import firestore from "@s/firebase/firestore";
import type { UserId } from "@s/firebase/types";
import { selectLoading, setTransition } from "@s/main";
import { selectUser } from "@s/user";
import { Interval } from "@s/util/constructors";
import { hasKey } from "@s/util/functions";
import type { SettingsState } from ".";
import {
  selectCookies,
  selectSyncSettings,
  setCookies,
  setSetting,
  toggleLich,
} from ".";
import type { Settings, ViewType } from "./types";

export const setCookie =
  (cname: string, cvalue: string, exdays: number): AppThunk<void> =>
  (dispatch, getState) => {
    const cookies = selectCookies(getState());
    if (cookies || cname === "accepted") {
      const d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      const expires = `expires=${d.toUTCString()}`;
      document.cookie = `${cname}=${cvalue};${expires};path=/`;
    }
  };

export const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
};

export const setStorage =
  <T>(name: string, value: T): AppThunk<void> =>
  (dispatch, getState) => {
    const cookies = selectCookies(getState());
    if (cookies) {
      localStorage.setItem(name, JSON.stringify(value));
    }
  };

export const getStorage = (name: string) => {
  const value = localStorage.getItem(name);
  return value ? JSON.parse(value) : value;
};

export const acceptCookies = (): AppThunk<void> => (dispatch) => {
  dispatch(setCookies(true));
  dispatch(setStorage("accepted", true));
};

export const clearCookies = (): AppThunk<void> => (dispatch) => {
  dispatch(setCookies(false));
  localStorage.removeItem("accepted");
};

export const syncSetting =
  <K extends keyof Settings>(
    setting: K,
    value: Settings[K]
  ): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const state = getState();
    const user = selectUser(state);
    const syncSettings = selectSyncSettings(state);
    if (user.id && syncSettings) {
      const userDocRef = firestore.collection("users").doc(user.id as UserId);
      const sync = async () => {
        try {
          await userDocRef.update({ [`settings.${setting}`]: value });
        } catch (error) {
          console.log(`Failed to sync settings: ${error}`);
          queue.notify({ title: `Failed to sync settings: ${error}` });
        }
      };
      try {
        const doc = await userDocRef.get();
        if (doc.exists) {
          sync();
        } else {
          await userDocRef.set({ settings: {} }, { merge: true });
          sync();
        }
      } catch (error) {
        console.log(`Failed to create settings object: ${error}`);
        queue.notify({
          title: `Failed to create settings object: ${error}`,
        });
      }
    }
  };

export const setView =
  (view: ViewType, write = true): AppThunk<void> =>
  (dispatch, getState) => {
    const state = getState();
    const { settings } = state;
    const loading = selectLoading(state);
    if (view !== settings.view && !loading) {
      dispatch((dispatch) => {
        dispatch(setTransition(true));
        setTimeout(() => {
          document.documentElement.scrollTop = 0;
          dispatch(setSetting("view", view));
        }, 90);
        setTimeout(() => {
          dispatch(setTransition(true));
        }, 300);
      });
    } else {
      dispatch(setSetting("view", view));
    }
    if (write) {
      syncSetting("view", view);
    }
  };

const isDarkTheme = (settings: SettingsState) => {
  const manualBool = settings.applyTheme === "manual" && settings.manualTheme;
  const systemBool =
    settings.applyTheme === "system" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const currentDay = DateTime.now();
  const [fromHour = "0", fromMinute = "0"] = settings.fromTimeTheme.split(":");
  const fromTime = currentDay.set({
    hour: parseInt(fromHour),
    minute: parseInt(fromMinute),
  });
  const [toHour = "0", toMinute = "0"] = settings.toTimeTheme.split(":");
  const toTime = currentDay.set({
    hour: parseInt(toHour),
    minute: parseInt(toMinute),
  });
  const timedBool =
    settings.applyTheme === "timed" &&
    (currentDay >= fromTime || currentDay <= toTime);
  return manualBool || systemBool || timedBool;
};

// eslint-disable-next-line no-use-before-define
let intervalCheckTheme: Interval<() => void>;

export const checkTheme = (): AppThunk<void> => (dispatch, getState) => {
  if (!intervalCheckTheme) {
    intervalCheckTheme = new Interval(() => dispatch(checkTheme()), 1000 * 60);
  }

  const state = getState();

  const { settings } = getState();
  const theme = settings.lichTheme
    ? "lich"
    : isDarkTheme(settings)
    ? settings.darkTheme
    : settings.lightTheme;
  if (selectTheme(state) !== theme) {
    dispatch(setTheme(theme));
  }
  const { documentElement: html } = document;
  html.setAttribute("class", theme);
  const meta = document.querySelector("meta[name=theme-color]");
  if (meta) {
    meta.setAttribute(
      "content",
      getComputedStyle(html).getPropertyValue("--theme-meta")
    );
  }
};

export const setApplyTheme =
  (applyTheme: string, write = true): AppThunk<void> =>
  (dispatch) => {
    dispatch(setSetting("applyTheme", applyTheme));
    dispatch(checkTheme());
    if (write) {
      dispatch(syncSetting("applyTheme", applyTheme));
    }
  };

export const setLightTheme =
  (theme: string, write = true): AppThunk<void> =>
  (dispatch) => {
    dispatch(setSetting("lightTheme", theme));
    dispatch(checkTheme());
    if (write) {
      dispatch(syncSetting("lightTheme", theme));
    }
  };

export const setDarkTheme =
  (theme: string, write = true): AppThunk<void> =>
  (dispatch) => {
    dispatch(setSetting("darkTheme", theme));
    dispatch(checkTheme());
    if (write) {
      dispatch(syncSetting("darkTheme", theme));
    }
  };

export const setManualTheme =
  (bool: boolean, write = true): AppThunk<void> =>
  (dispatch) => {
    dispatch(setSetting("manualTheme", bool));
    dispatch(checkTheme());
    if (write) {
      dispatch(syncSetting("manualTheme", bool));
    }
  };

export const setFromTimeTheme =
  (time: string, write = true): AppThunk<void> =>
  (dispatch) => {
    dispatch(setSetting("fromTimeTheme", time));
    dispatch(checkTheme());
    if (write) {
      dispatch(syncSetting("fromTimeTheme", time));
    }
  };

export const setToTimeTheme =
  (time: string, write = true): AppThunk<void> =>
  (dispatch) => {
    dispatch(setSetting("toTimeTheme", time));
    dispatch(checkTheme());
    if (write) {
      dispatch(syncSetting("toTimeTheme", time));
    }
  };

export const toggleLichTheme = (): AppThunk<void> => (dispatch) => {
  dispatch(toggleLich());
  dispatch(checkTheme());
};

export const setBottomNav =
  (value: boolean, write = true): AppThunk<void> =>
  (dispatch) => {
    document.documentElement.scrollTop = 0;
    dispatch(setSetting("bottomNav", value));
    if (write) {
      dispatch(syncSetting("bottomNav", value));
    }
  };

export const setDensity =
  (density: string, write = true): AppThunk<void> =>
  (dispatch) => {
    dispatch(setSetting("density", density));
    if (write) {
      dispatch(syncSetting("density", density));
    }
  };

export const settingFns: Record<
  string,
  (val: any, write?: boolean) => AppThunk<void>
> = {
  applyTheme: setApplyTheme,
  bottomNav: setBottomNav,
  darkTheme: setDarkTheme,
  density: setDensity,
  fromTimeTheme: setFromTimeTheme,
  lightTheme: setLightTheme,
  manualTheme: setManualTheme,
  toTimeTheme: setToTimeTheme,
  view: setView,
};

export const checkStorage = (): AppThunk<void> => (dispatch) => {
  const acceptedCookie = getCookie("accepted");
  const accepted = getStorage("accepted");
  if (acceptedCookie === "true" || accepted) {
    dispatch(setCookies(true));

    const convertCookie = (
      key: string,
      setFunction: (val: any, write?: boolean) => AppThunk<void>
    ) => {
      const cookie = getCookie(key);
      const storage = getStorage(key);
      if (cookie || (storage !== null && key !== "accepted")) {
        if (cookie !== "true" && cookie !== "false") {
          setTimeout(() => {
            dispatch(setFunction(cookie || storage, false));
            localStorage.removeItem(key);
            dispatch(setCookie(key, cookie || "", -1));
          }, 0);
        } else {
          const cookieBool = cookie === "true";
          setTimeout(() => {
            dispatch(setFunction(cookieBool ?? storage, false));
            if (key === "accepted") {
              dispatch(setStorage("accepted", true));
            } else {
              localStorage.removeItem(key);
            }
            dispatch(setCookie(key, cookie, -1));
          }, 0);
        }
      }
    };

    Object.entries(settingFns).forEach(([setting, func]) => {
      convertCookie(setting, func);
    });
  }
};

export const setSyncSettings =
  (bool: boolean, write = true): AppThunk<void> =>
  async (dispatch, getState) => {
    const state = getState();
    const { settings } = state;
    const user = selectUser(state);
    dispatch(setSetting("syncSettings", bool));
    if (write) {
      const settingsObject: Record<string, any> = {};
      if (bool) {
        Object.keys(settingFns).forEach((setting) => {
          if (hasKey(settings, setting)) {
            ({ [setting]: settingsObject[setting] } = settings);
          }
        });
      }
      try {
        await firestore
          .collection("users")
          .doc(user.id as UserId)
          .set(
            { settings: settingsObject, syncSettings: bool },
            { merge: true }
          );
      } catch (error) {
        console.log(`Failed to set sync setting: ${error}`);
        queue.notify({ title: `Failed to set sync setting: ${error}` });
      }
    }
  };
