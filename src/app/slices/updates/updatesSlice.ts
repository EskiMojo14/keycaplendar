import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { UpdateEntryType } from "./types";

type UpdatesState = {
  loading: boolean;

  entries: UpdateEntryType[];
};

const initialState: UpdatesState = {
  loading: false,

  entries: [],
};

export const updatesSlice = createSlice({
  name: "updates",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setEntries: (state, action: PayloadAction<UpdateEntryType[]>) => {
      state.entries = action.payload;
    },
  },
});

export const { setLoading, setEntries } = updatesSlice.actions;

export const selectLoading = (state: RootState) => state.updates.loading;

export const selectEntries = (state: RootState) => state.updates.entries;

export default updatesSlice.reducer;
