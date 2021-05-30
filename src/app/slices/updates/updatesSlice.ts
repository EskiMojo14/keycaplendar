import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { UpdateEntryType } from "./types";

type UpdatesState = {
  loading: boolean;

  entries: UpdateEntryType[];
  urlEntry: string;
};

const initialState: UpdatesState = {
  loading: false,

  entries: [],
  urlEntry: "",
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
    setURLEntry: (state, action: PayloadAction<string>) => {
      state.urlEntry = action.payload;
    },
  },
});

export const { setLoading, setEntries, setURLEntry } = updatesSlice.actions;

export const selectLoading = (state: RootState) => state.updates.loading;

export const selectEntries = (state: RootState) => state.updates.entries;

export const selectURLEntry = (state: RootState) => state.updates.urlEntry;

export default updatesSlice.reducer;
