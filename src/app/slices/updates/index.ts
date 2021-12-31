import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import type { UpdateEntryType } from "./types";

type UpdatesState = {
  entries: UpdateEntryType[];
  loading: boolean;
  urlEntry: string;
};

export const initialState: UpdatesState = {
  loading: false,

  entries: [],
  urlEntry: "",
};

export const updatesSlice = createSlice({
  name: "updates",
  initialState,
  reducers: {
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setEntries: (state, { payload }: PayloadAction<UpdateEntryType[]>) => {
      state.entries = payload;
    },
    setURLEntry: (state, { payload }: PayloadAction<string>) => {
      state.urlEntry = payload;
    },
  },
});

export const {
  actions: { setEntries, setLoading, setURLEntry },
} = updatesSlice;

export const selectLoading = (state: RootState) => state.updates.loading;

export const selectEntries = (state: RootState) => state.updates.entries;

export const selectURLEntry = (state: RootState) => state.updates.urlEntry;

export default updatesSlice.reducer;
