import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

type CommonState = {
  device: "mobile" | "tablet" | "desktop";
};

const initialState: CommonState = {
  device: "tablet",
};

export const commonSlice = createSlice({
  name: "display",
  initialState,
  reducers: {
    setDevice: (state, action: PayloadAction<"mobile" | "tablet" | "desktop">) => {
      state.device = action.payload;
    },
  },
});

export const { setDevice } = commonSlice.actions;

export const selectDevice = (state: RootState) => state.common.device;

export default commonSlice.reducer;
