import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { Page } from "./types";

export type CommonState = {
  device: "mobile" | "tablet" | "desktop";
  orientation: "portrait" | "landscape";
  page: Page;
  theme: string;
};

export const initialState: CommonState = {
  device: "tablet",
  orientation: "landscape",
  page: "images",
  theme: "light",
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
  },
});

export const { setDevice, setOrientation, setAppPage, setTheme } = commonSlice.actions;

export const selectDevice = (state: RootState) => state.common.device;

export const selectOrientation = (state: RootState) => state.common.orientation;

export const selectPage = (state: RootState) => state.common.page;

export const selectTheme = (state: RootState) => state.common.theme;

export default commonSlice.reducer;
