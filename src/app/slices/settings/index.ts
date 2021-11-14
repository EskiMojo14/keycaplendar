import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { ViewType } from "./types";

type SettingsState = {
  view: ViewType;
  bottomNav: boolean;
  applyTheme: string;
  lightTheme: string;
  darkTheme: string;
  manualTheme: boolean;
  fromTimeTheme: string;
  toTimeTheme: string;
  lichTheme: boolean;
  density: string;
  syncSettings: boolean;
  cookies: boolean;

  shareNameLoading: boolean;
};

export const initialState: SettingsState = {
  view: "card",
  bottomNav: false,
  applyTheme: "manual",
  lightTheme: "light",
  darkTheme: "deep",
  manualTheme: false,
  fromTimeTheme: "21:00",
  toTimeTheme: "06:00",
  lichTheme: false,
  density: "default",
  syncSettings: false,
  cookies: false,

  shareNameLoading: false,
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettingState: <T extends keyof SettingsState>(
      state: SettingsState,
      action: PayloadAction<{ key: T; value: SettingsState[T] }>
    ) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
    setSettings: (state, action: PayloadAction<Partial<SettingsState>>) => ({
      ...state,
      ...action.payload,
    }),
    toggleLich: (state) => {
      state.lichTheme = !state.lichTheme;
    },
    setCookies: (state, action: PayloadAction<boolean>) => {
      state.cookies = action.payload;
    },
    setShareNameLoading: (state, action: PayloadAction<boolean>) => {
      state.shareNameLoading = action.payload;
    },
  },
});

export const { setSettingState, setSettings, toggleLich, setCookies, setShareNameLoading } = settingsSlice.actions;

export const setSetting = <P extends ReturnType<typeof setSettingState>["payload"]>(key: P["key"], value: P["value"]) =>
  setSettingState({ key, value });

export const selectSettings = (state: RootState) => state.settings;

export const selectBottomNav = (state: RootState) => state.settings.bottomNav && state.common.device === "mobile";

export const selectView = (state: RootState) => state.settings.view;

export const selectCookies = (state: RootState) => state.settings.cookies;

export const selectSyncSettings = (state: RootState) => state.settings.syncSettings;

export const selectShareNameLoading = (state: RootState) => state.settings.shareNameLoading;

export default settingsSlice.reducer;
