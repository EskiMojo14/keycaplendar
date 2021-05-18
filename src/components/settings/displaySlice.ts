import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

type DisplayState = {
  device: "mobile" | "tablet" | "desktop";
};

const initialState: DisplayState = {
  device: "tablet",
};

export const displaySlice = createSlice({
  name: "display",
  initialState,
  reducers: {
    setDevice: (state, action: PayloadAction<"mobile" | "tablet" | "desktop">) => {
      state.device = action.payload;
    },
  },
});

export const { setDevice } = displaySlice.actions;

export const selectDevice = (state: RootState) => state.display.device;

export default displaySlice.reducer;
