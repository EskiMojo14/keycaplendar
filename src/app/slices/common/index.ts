import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import {
  selectApplyTheme,
  selectDarkTheme,
  selectLichTheme,
  selectLightTheme,
  selectManualTheme,
} from "@s/settings";
import type { Page } from "./types";

export type CommonState = {
  page: Page;
  systemTheme: "dark" | "light";
  timed: "dark" | "light";
};

export const initialState: CommonState = {
  page: "calendar",
  systemTheme: "light",
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
    setTimed: (state, { payload }: PayloadAction<boolean>) => {
      state.timed = payload ? "dark" : "light";
    },
  },
});

export const {
  actions: { setAppPage, setSystemTheme, setTimed },
} = commonSlice;

export const selectPage = (state: RootState) => state.common.page;

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

export default commonSlice.reducer;
