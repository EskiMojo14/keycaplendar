import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import type { ViewType } from "./types";

export type SettingsState = {
  applyTheme: string;
  bottomNav: boolean;
  cookies: boolean;
  darkTheme: string;
  density: string;
  fromTimeTheme: string;
  lichTheme: boolean;
  lightTheme: string;
  manualTheme: "dark" | "light";
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
  manualTheme: "light",
  shareNameLoading: false,
  syncSettings: false,
  toTimeTheme: "06:00",
  view: "card",
};

export const settingsSlice = createSlice({
  initialState,
  name: "settings",
  reducers: {
    cookieDecision: (state, { payload }: PayloadAction<boolean>) => {
      state.cookies = payload;
    },
    manualThemeChange: (state, { payload }: PayloadAction<boolean>) => {
      state.manualTheme = payload ? "dark" : "light";
    },
    settingChange: {
      prepare: <K extends keyof SettingsState>(
        key: K,
        value: SettingsState[K]
      ) => ({ payload: { key, value } }),
      reducer: <K extends keyof SettingsState>(
        state: SettingsState,
        { payload }: PayloadAction<{ key: K; value: SettingsState[K] }>
      ) => {
        const { key, value } = payload;
        state[key] = value;
      },
    },
    settingsChange: (
      state,
      { payload }: PayloadAction<Partial<SettingsState>>
    ) => ({
      ...state,
      ...payload,
    }),
    shareNameLoad: (state, { payload }: PayloadAction<boolean>) => {
      state.shareNameLoading = payload;
    },
    toggleLich: (state) => {
      state.lichTheme = !state.lichTheme;
    },
  },
});

export const {
  actions: {
    cookieDecision,
    manualThemeChange,
    settingsChange,
    shareNameLoad,
    toggleLich,
  },
} = settingsSlice;

export const selectSettings = (state: RootState) => state.settings;

export const selectDensity = (state: RootState) => state.settings.density;

export const selectBottomNav = (state: RootState) => state.settings.bottomNav;

export const selectView = (state: RootState) => state.settings.view;

export const selectCookies = (state: RootState) => state.settings.cookies;

export const selectSyncSettings = (state: RootState) =>
  state.settings.syncSettings;

export const selectShareNameLoading = (state: RootState) =>
  state.settings.shareNameLoading;

export const selectApplyTheme = (state: RootState) => state.settings.applyTheme;

export const selectLichTheme = (state: RootState) => state.settings.lichTheme;

export const selectDarkTheme = (state: RootState) => state.settings.darkTheme;

export const selectLightTheme = (state: RootState) => state.settings.lightTheme;

export const selectFromTimeTheme = (state: RootState) =>
  state.settings.fromTimeTheme;

export const selectToTimeTheme = (state: RootState) =>
  state.settings.toTimeTheme;

export const selectManualTheme = (state: RootState) =>
  state.settings.manualTheme;

export default settingsSlice.reducer;

const {
  actions: { settingChange: _settingChange },
} = settingsSlice;

/** wrapper to make sure generics work */
export const settingChange = (<K extends keyof SettingsState>(
  key: K,
  value: SettingsState[K]
) => _settingChange(key, value)) as Pick<
  typeof _settingChange,
  "match" | "type"
> &
  (<K extends keyof SettingsState>(
    // eslint-disable-next-line no-use-before-define
    key: K,
    // eslint-disable-next-line no-use-before-define
    value: SettingsState[K]
  ) => ReturnType<typeof _settingChange>);

// carry over type and match properties
Object.assign(settingChange, _settingChange);
