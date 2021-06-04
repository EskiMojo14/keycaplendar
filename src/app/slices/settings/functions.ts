import { DateTime } from "luxon";
import { typedFirestore } from "../firebase/firestore";
import { UserId } from "../firebase/types";
import { queue } from "../../snackbarQueue";
import store from "../../store";
import { setCookies, setSettings, toggleLich } from "./settingsSlice";
import { ViewType } from "./types";
import { Interval } from "../common/constructors";
import { hasKey } from "../common/functions";
import { whitelistParams } from "../main/constants";
import { setTransition } from "../main/mainSlice";
import { selectPreset } from "../main/functions";

const { dispatch } = store;

export const acceptCookies = () => {
  dispatch(setCookies(true));
  setCookie("accepted", "true", 356);
};

export const clearCookies = () => {
  dispatch(setCookies(false));
  setCookie("accepted", "false", -1);
};

export const setCookie = (cname: string, cvalue: string, exdays: number) => {
  const {
    settings: { cookies },
  } = store.getState();
  if (cookies || cname === "accepted") {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
};

export const getCookie = (cname: string) => {
  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
};

export const setStorage = (name: string, value: any) => {
  const {
    settings: { cookies },
  } = store.getState();
  if (cookies) {
    localStorage.setItem(name, JSON.stringify(value));
  }
};

export const getStorage = (name: string) => {
  const value = localStorage.getItem(name);
  return value ? JSON.parse(value) : value;
};

export const checkStorage = () => {
  const accepted = getCookie("accepted");
  const { settings } = store.getState();
  if (accepted && accepted === "true") {
    dispatch(setCookies(true));

    const convertCookie = (key: string, setFunction: (val: any, write: boolean) => void) => {
      const cookie = getCookie(key);
      if (cookie) {
        if (cookie !== "true" && cookie !== "false") {
          setTimeout(() => {
            setFunction(cookie, false);
            setStorage(key, cookie);
            setCookie(key, cookie, -1);
          }, 0);
        } else {
          const cookieBool = cookie === "true";
          setTimeout(() => {
            setFunction(cookieBool, false);
            setStorage(key, cookieBool);
            setCookie(key, cookie, -1);
          }, 0);
        }
      }
    };

    const fetchAndSet = (key: string, setFunction: (val: any, write: boolean) => void) => {
      const val = getStorage(key);
      if (val && hasKey(settings, key)) {
        const currentSetting = settings[key];
        if (val !== currentSetting) {
          setTimeout(() => {
            setFunction(val, false);
          }, 0);
        }
      }
    };

    Object.keys(settingFns).forEach((setting) => {
      if (hasKey(settingFns, setting)) {
        const func = settingFns[setting];
        fetchAndSet(setting, func);
        convertCookie(setting, func);
      }
    });

    const storedPreset = getStorage("presetId");
    const params = new URLSearchParams(window.location.search);
    const noUrlParams = !whitelistParams.some((param) => params.has(param));
    if (storedPreset && storedPreset !== "default" && noUrlParams) {
      selectPreset(storedPreset, false);
    }
  }
};

export const setView = (view: ViewType, write = true) => {
  const {
    settings,
    main: { loading },
  } = store.getState();
  if (view !== settings.view && !loading) {
    dispatch(setTransition(true));
    setTimeout(() => {
      document.documentElement.scrollTop = 0;
      dispatch(setSettings({ view: view }));
    }, 90);
    setTimeout(() => {
      dispatch(setTransition(true));
    }, 300);
  } else {
    dispatch(setSettings({ view: view }));
  }
  if (write) {
    setStorage("view", view);
    syncSetting("view", view);
  }
};

export const setSyncSettings = (bool: boolean, write = true) => {
  const {
    settings,
    user: { user },
  } = store.getState();
  dispatch(setSettings({ syncSettings: bool }));
  if (write) {
    const settingsObject: { [key: string]: any } = {};
    if (bool) {
      Object.keys(settingFns).forEach((setting) => {
        if (hasKey(settings, setting)) {
          settingsObject[setting] = settings[setting];
        }
      });
    }
    typedFirestore
      .collection("users")
      .doc(user.id as UserId)
      .set({ syncSettings: bool, settings: settingsObject }, { merge: true })
      .catch((error) => {
        console.log("Failed to set sync setting: " + error);
        queue.notify({ title: "Failed to set sync setting: " + error });
      });
  }
};

export const syncSetting = (setting: string, value: any) => {
  const {
    user: { user },
    settings: { syncSettings },
  } = store.getState();
  if (user.id && syncSettings) {
    const userDocRef = typedFirestore.collection("users").doc(user.id as UserId);
    userDocRef.get().then((doc) => {
      if (doc.exists) {
        sync();
      } else {
        userDocRef
          .set({ settings: {} }, { merge: true })
          .then(() => {
            sync();
          })
          .catch((error) => {
            console.log("Failed to create settings object: " + error);
            queue.notify({ title: "Failed to create settings object: " + error });
          });
      }
    });
    const sync = () => {
      const settingObject: { [key: string]: any } = {};
      settingObject[`settings.${setting}`] = value;
      userDocRef.update(settingObject).catch((error) => {
        console.log("Failed to sync settings: " + error);
        queue.notify({ title: "Failed to sync settings: " + error });
      });
    };
  }
};

const isDarkTheme = () => {
  const { settings } = store.getState();
  const manualBool = settings.applyTheme === "manual" && settings.manualTheme;
  const systemBool =
    settings.applyTheme === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  const currentDay = DateTime.now();
  const fromArray = settings.fromTimeTheme.split(":");
  const fromTime = currentDay.set({ hour: parseInt(fromArray[0]), minute: parseInt(fromArray[1]) });
  const toArray = settings.toTimeTheme.split(":");
  const toTime = currentDay.set({ hour: parseInt(toArray[0]), minute: parseInt(toArray[1]) });
  const timedBool = settings.applyTheme === "timed" && (currentDay >= fromTime || currentDay <= toTime);
  return manualBool || systemBool || timedBool;
};

export const checkTheme = () => {
  const { settings } = store.getState();
  const themeBool = isDarkTheme();
  const theme = settings.lichTheme ? "lich" : themeBool === true ? settings.darkTheme : settings.lightTheme;
  const html = document.documentElement;
  html.setAttribute("class", "");
  html.classList.add(theme);
  const meta = document.querySelector("meta[name=theme-color]");
  if (meta) {
    meta.setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--meta-color"));
  }
};

export const setApplyTheme = (applyTheme: string, write = true) => {
  dispatch(setSettings({ applyTheme: applyTheme }));
  const timed = new Interval(checkTheme, 1000 * 60);
  if (applyTheme === "system") {
    setTimeout(checkTheme, 1);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      e.preventDefault();
      checkTheme();
    });
  } else {
    setTimeout(checkTheme, 1);
  }
  if (applyTheme !== "timed") {
    setTimeout(timed.clear, 1000 * 10);
  }
  if (write) {
    setStorage("applyTheme", applyTheme);
    syncSetting("applyTheme", applyTheme);
  }
};

export const setLightTheme = (theme: string, write = true) => {
  dispatch(setSettings({ lightTheme: theme }));
  setTimeout(checkTheme, 1);
  if (write) {
    setStorage("lightTheme", theme);
    syncSetting("lightTheme", theme);
  }
};

export const setDarkTheme = (theme: string, write = true) => {
  dispatch(setSettings({ darkTheme: theme }));
  setTimeout(checkTheme, 1);
  if (write) {
    setStorage("darkTheme", theme);
    syncSetting("darkTheme", theme);
  }
};

export const setManualTheme = (bool: boolean, write = true) => {
  dispatch(setSettings({ manualTheme: bool }));
  setTimeout(checkTheme, 1);
  if (write) {
    setStorage("manualTheme", bool);
    syncSetting("manualTheme", bool);
  }
};

export const setFromTimeTheme = (time: string, write = true) => {
  dispatch(setSettings({ fromTimeTheme: time }));
  setTimeout(checkTheme, 1);
  if (write) {
    setStorage("fromTimeTheme", time);
    syncSetting("fromTimeTheme", time);
  }
};

export const setToTimeTheme = (time: string, write = true) => {
  dispatch(setSettings({ toTimeTheme: time }));
  setTimeout(checkTheme, 1);
  if (write) {
    setStorage("toTimeTheme", time);
    syncSetting("toTimeTheme", time);
  }
};

export const toggleLichTheme = () => {
  dispatch(toggleLich());
  setTimeout(checkTheme, 1);
};

export const setBottomNav = (value: boolean, write = true) => {
  document.documentElement.scrollTop = 0;
  dispatch(setSettings({ bottomNav: value }));
  if (write) {
    setStorage("bottomNav", value);
    syncSetting("bottomNav", value);
  }
};

export const setDensity = (density: string, write = true) => {
  dispatch(setSettings({ density: density }));
  if (write) {
    setStorage("density", density);
    syncSetting("density", density);
  }
};

export const settingFns: Record<string, (val: any, write: boolean) => void> = {
  view: setView,
  bottomNav: setBottomNav,
  applyTheme: setApplyTheme,
  lightTheme: setLightTheme,
  darkTheme: setDarkTheme,
  manualTheme: setManualTheme,
  fromTimeTheme: setFromTimeTheme,
  toTimeTheme: setToTimeTheme,
  density: setDensity,
};
