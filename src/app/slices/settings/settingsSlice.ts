import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
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
};

const initialState: SettingsState = {
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
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSetting: <T extends keyof SettingsState>(
      state: SettingsState,
      action: PayloadAction<{ key: T; value: SettingsState[T] }>
    ) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
    setSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      state = Object.assign(state, action.payload);
    },
    toggleLich: (state) => {
      state.lichTheme = !state.lichTheme;
    },
  },
});

export const { setSetting, setSettings, toggleLich } = settingsSlice.actions;

export const selectSettings = (state: RootState) => state.settings;

export const selectBottomNav = (state: RootState) => state.settings.bottomNav && state.common.device === "mobile";

export const selectMainView = (state: RootState) => state.settings.view;

export default settingsSlice.reducer;
