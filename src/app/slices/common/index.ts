import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { Page, ThemeMap, GraphColors } from "./types";

export type CommonState = {
  device: "mobile" | "tablet" | "desktop";
  orientation: "portrait" | "landscape";
  page: Page;
  theme: string;
  themeMaps: Record<string, ThemeMap>;
  graphColors: GraphColors;
};

export const initialState: CommonState = {
  device: "tablet",
  orientation: "landscape",
  page: "images",
  theme: "light",
  themeMaps: {},
  graphColors: {
    light: {
      rainbow: [],
      heatmap: [],
    },
    dark: {
      rainbow: [],
      heatmap: [],
    },
  },
};

export const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    setDevice: (state, action: PayloadAction<"mobile" | "tablet" | "desktop">) => {
      state.device = action.payload;
    },
    setOrientation: (state, action: PayloadAction<"portrait" | "landscape">) => {
      state.orientation = action.payload;
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
    setGraphColors: (state, action: PayloadAction<GraphColors>) => {
      state.graphColors = action.payload;
    },
  },
});

export const { setDevice, setOrientation, setAppPage, setTheme, setThemeMaps, setGraphColors } = commonSlice.actions;

export const selectDevice = (state: RootState) => state.common.device;

export const selectOrientation = (state: RootState) => state.common.orientation;

export const selectPage = (state: RootState) => state.common.page;

export const selectTheme = (state: RootState) => state.common.theme;

export const selectThemesMap = (state: RootState) => state.common.themeMaps;

export const selectCurrentThemeMap = createSelector(
  [selectTheme, selectThemesMap],
  (theme, themesMap) => themesMap[theme] as ThemeMap | undefined
);

export const selectGraphColors = (state: RootState) => state.common.graphColors;

export const selectCurrentGraphColors = createSelector(
  [selectGraphColors, selectCurrentThemeMap],
  (graphColors, themeMap) => graphColors[themeMap?.dark ? "dark" : "light"]
);

export default commonSlice.reducer;
