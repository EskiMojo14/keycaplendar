import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { Dictionary, PayloadAction } from "@reduxjs/toolkit";
import { DateTime } from "luxon";
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
  time: string;
};

export const initialState: CommonState = {
  device: "tablet",
  orientation: "landscape",
  page: "calendar",
  systemTheme: "light",
  themeMaps: {},
  time: "",
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
    setTime: (state, { payload }: PayloadAction<string>) => {
      state.time = payload;
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
    setTime,
  },
} = commonSlice;

export const selectDevice = (state: RootState) => state.common.device;

export const selectOrientation = (state: RootState) => state.common.orientation;

export const selectPage = (state: RootState) => state.common.page;

export const selectThemesMap = (state: RootState) => state.common.themeMaps;

export const selectSystemTheme = (state: RootState) => state.common.systemTheme;

export const selectTime = (state: RootState) => state.common.time;

export const selectTheme = createSelector(
  selectTime,
  selectSystemTheme,
  selectApplyTheme,
  selectLichTheme,
  selectDarkTheme,
  selectLightTheme,
  selectFromTimeTheme,
  selectToTimeTheme,
  selectManualTheme,
  (
    time,
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
        const now = DateTime.fromFormat(time, "HH:mm");
        let start = DateTime.fromFormat(fromTimeTheme, "HH:mm");
        const end = DateTime.fromFormat(toTimeTheme, "HH:mm");
        if (start > end) {
          start = start.minus({ day: 1 });
        }
        return start <= now && now <= end ? darkTheme : lightTheme;
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
