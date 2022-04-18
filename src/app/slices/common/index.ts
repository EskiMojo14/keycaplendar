import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { Dictionary, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import {
  selectApplyTheme,
  selectDarkTheme,
  selectLichTheme,
  selectLightTheme,
  selectManualTheme,
} from "@s/settings";
import type { Page, ThemeMap } from "./types";

export type CommonState = {
  page: Page;
  systemTheme: "dark" | "light";
  themeMaps: Dictionary<ThemeMap>;
  timed: "dark" | "light";
};

export const initialState: CommonState = {
  page: "calendar",
  systemTheme: "light",
  themeMaps: {},
  timed: "light",
};

export const commonSlice = createSlice({
  initialState,
  name: "common",
  reducers: {
    setAppPage: (state, { payload }: PayloadAction<Page>) => {
      state.page = payload;
    },
    setSystemTheme: (state, { payload }: PayloadAction<boolean>) => {
      state.systemTheme = payload ? "dark" : "light";
    },
    setThemeMaps: (state, { payload }: PayloadAction<Dictionary<ThemeMap>>) => {
      state.themeMaps = payload;
    },
    setTimed: (state, { payload }: PayloadAction<boolean>) => {
      state.timed = payload ? "dark" : "light";
    },
  },
});

export const {
  actions: { setAppPage, setSystemTheme, setThemeMaps, setTimed },
} = commonSlice;

export const selectPage = (state: RootState) => state.common.page;

export const selectThemesMap = (state: RootState) => state.common.themeMaps;

export const selectSystemTheme = (state: RootState) => state.common.systemTheme;

export const selectTimed = (state: RootState) => state.common.timed;

export const selectTheme = createSelector(
  selectApplyTheme,
  selectManualTheme,
  selectTimed,
  selectSystemTheme,
  selectLichTheme,
  selectLightTheme,
  selectDarkTheme,
  (
    applyTheme,
    manualTheme,
    timedDark,
    systemTheme,
    lichTheme,
    lightTheme,
    darkTheme
  ) => {
    if (lichTheme) {
      return "lich";
    }
    switch (applyTheme) {
      case "manual": {
        return manualTheme === "dark" ? darkTheme : lightTheme;
      }
      case "system": {
        return systemTheme === "dark" ? darkTheme : lightTheme;
      }
      case "timed": {
        return timedDark === "dark" ? darkTheme : lightTheme;
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
