import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import type { ViewType } from "./types";

type SettingsState = {
  applyTheme: string;
  bottomNav: boolean;
  cookies: boolean;
  darkTheme: string;
  density: string;
  fromTimeTheme: string;
  lichTheme: boolean;
  lightTheme: string;
  manualTheme: boolean;
  shareNameLoading: boolean;
  syncSettings: boolean;
  toTimeTheme: string;
  view: ViewType;
};

export const initialState: SettingsState = {
  applyTheme: "manual",
  bottomNav: false,
  cookies: false,
  darkTheme: "deep",
  density: "default",
  fromTimeTheme: "21:00",
  lichTheme: false,
  lightTheme: "light",
  manualTheme: false,
  shareNameLoading: false,
  syncSettings: false,
  toTimeTheme: "06:00",
  view: "card",
};

export const settingsSlice = createSlice({
  initialState,
  name: "settings",
  reducers: {
    setCookies: (state, { payload }: PayloadAction<boolean>) => {
      state.cookies = payload;
    },
    setSettings: (
      state,
      { payload }: PayloadAction<Partial<SettingsState>>
    ) => ({
      ...state,
      ...payload,
    }),
    setSettingState: <K extends keyof SettingsState>(
      state: SettingsState,
      { payload }: PayloadAction<{ key: K; value: SettingsState[K] }>
    ) => {
      const { key, value } = payload;
      state[key] = value;
    },
    setShareNameLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.shareNameLoading = payload;
    },
    toggleLich: (state) => {
      state.lichTheme = !state.lichTheme;
    },
  },
});

export const {
  actions: {
    setCookies,
    setSettings,
    setSettingState,
    setShareNameLoading,
    toggleLich,
  },
} = settingsSlice;

export const setSetting = <K extends keyof SettingsState>(
  key: K,
  value: SettingsState[K]
) => setSettingState({ key, value });

export const selectSettings = (state: RootState) => state.settings;

export const selectBottomNav = (state: RootState) =>
  state.settings.bottomNav && state.common.device === "mobile";

export const selectView = (state: RootState) => state.settings.view;

export const selectCookies = (state: RootState) => state.settings.cookies;

export const selectSyncSettings = (state: RootState) =>
  state.settings.syncSettings;

export const selectShareNameLoading = (state: RootState) =>
  state.settings.shareNameLoading;

export default settingsSlice.reducer;
