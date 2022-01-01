import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import type { Page } from "./types";

export type CommonState = {
  device: "desktop" | "mobile" | "tablet";
  orientation: "landscape" | "portrait";
  page: Page;
  theme: string;
};

export const initialState: CommonState = {
  device: "tablet",
  orientation: "landscape",
  page: "calendar",
  theme: "light",
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
    setTheme: (state, { payload }: PayloadAction<string>) => {
      state.theme = payload;
    },
  },
});

export const {
  actions: { setAppPage, setDevice, setOrientation, setTheme },
} = commonSlice;

export const selectDevice = (state: RootState) => state.common.device;

export const selectOrientation = (state: RootState) => state.common.orientation;

export const selectPage = (state: RootState) => state.common.page;

export const selectTheme = (state: RootState) => state.common.theme;

export default commonSlice.reducer;
