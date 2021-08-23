import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { Page } from "./types";

type CommonState = {
  device: "mobile" | "tablet" | "desktop";
  page: Page;
};

export const initialState: CommonState = {
  device: "tablet",
  page: "images",
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
  },
});

export const { setDevice, setAppPage } = commonSlice.actions;

export const selectDevice = (state: RootState) => state.common.device;

export const selectPage = (state: RootState) => state.common.page;

export default commonSlice.reducer;
