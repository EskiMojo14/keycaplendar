import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { Page, ThemeMap } from "./types";

export type CommonState = {
  device: "mobile" | "tablet" | "desktop";
  page: Page;
  theme: string;
  themeMaps: Record<string, ThemeMap>;
};

export const initialState: CommonState = {
  device: "tablet",
  page: "images",
  theme: "light",
  themeMaps: {},
};

export const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    setDevice: (state, action: PayloadAction<"mobile" | "tablet" | "desktop">) => {
      state.device = action.payload;
    },
    setAppPage: (state, action: PayloadAction<Page>) => {
      state.page = action.payload;
    },
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
    },
    setThemeMaps: (state, action: PayloadAction<Record<string, ThemeMap>>) => {
      state.themeMaps = action.payload;
    },
  },
});

export const { setDevice, setTheme, setAppPage, setThemeMaps } = commonSlice.actions;

export const selectDevice = (state: RootState) => state.common.device;

export const selectPage = (state: RootState) => state.common.page;

export const selectTheme = (state: RootState) => state.common.theme;

export const selectThemesMap = (state: RootState) => state.common.themeMaps;

export const selectCurrentThemeMap = createSelector(
  [selectTheme, selectThemesMap],
  (theme, themesMap) => themesMap[theme]
);

export default commonSlice.reducer;
