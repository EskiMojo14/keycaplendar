import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { Dictionary, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import {
  selectApplyTheme,
  selectDarkTheme,
  selectFromTimeTheme,
  selectLichTheme,
  selectLightTheme,
  selectManualTheme,
  selectToTimeTheme,
} from "@s/settings";
import type { Page, ThemeMap } from "./types";

export type CommonState = {
  device: "desktop" | "mobile" | "tablet";
  orientation: "landscape" | "portrait";
  page: Page;
  systemTheme: "dark" | "light";
  themeMaps: Dictionary<ThemeMap>;
  /** whether to use dark theme when applytheme is timed */
  timedDark: boolean;
};

export const initialState: CommonState = {
  device: "tablet",
  orientation: "landscape",
  page: "calendar",
  systemTheme: "light",
  themeMaps: {},
  timedDark: false,
};

export const commonSlice = createSlice({
  initialState,
  name: "common",
  reducers: {
    setAppPage: (state, { payload }: PayloadAction<Page>) => {
      state.page = payload;
    },
    setDevice: (
      state,
      { payload }: PayloadAction<"desktop" | "mobile" | "tablet">
    ) => {
      state.device = payload;
    },
    setOrientation: (
      state,
      { payload }: PayloadAction<"landscape" | "portrait">
    ) => {
      state.orientation = payload;
    },
    setSystemTheme: (state, { payload }: PayloadAction<boolean>) => {
      state.systemTheme = payload ? "dark" : "light";
    },
    setThemeMaps: (state, { payload }: PayloadAction<Dictionary<ThemeMap>>) => {
      state.themeMaps = payload;
    },
    setTimedDark: (state, { payload }: PayloadAction<boolean>) => {
      state.timedDark = payload;
    },
  },
});

export const {
  actions: {
    setAppPage,
    setDevice,
    setOrientation,
    setSystemTheme,
    setThemeMaps,
    setTimedDark,
  },
} = commonSlice;

export const selectDevice = (state: RootState) => state.common.device;

export const selectOrientation = (state: RootState) => state.common.orientation;

export const selectPage = (state: RootState) => state.common.page;

export const selectThemesMap = (state: RootState) => state.common.themeMaps;

export const selectSystemTheme = (state: RootState) => state.common.systemTheme;

export const selectTimedDark = (state: RootState) => state.common.timedDark;

export const selectTheme = createSelector(
  selectTimedDark,
  selectSystemTheme,
  selectApplyTheme,
  selectLichTheme,
  selectDarkTheme,
  selectLightTheme,
  selectFromTimeTheme,
  selectToTimeTheme,
  selectManualTheme,
  (
    timedDark,
    systemTheme,
    applyTheme,
    lichTheme,
    darkTheme,
    lightTheme,
    fromTimeTheme,
    toTimeTheme,
    manualTheme
  ) => {
    if (lichTheme) {
      return "lich";
    }
    switch (applyTheme) {
      case "manual": {
        return manualTheme ? darkTheme : lightTheme;
      }
      case "system": {
        return systemTheme === "dark" ? darkTheme : lightTheme;
      }
      case "timed": {
        return timedDark ? darkTheme : lightTheme;
      }
      default: {
        return lightTheme;
      }
    }
  }
);

export const selectCurrentThemeMap = createSelector(
  selectTheme,
  selectThemesMap,
  (theme, themesMap) => themesMap[theme]
);

export default commonSlice.reducer;
