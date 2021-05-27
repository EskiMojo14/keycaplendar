import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { GuideEntryType } from "./types";

type UpdatesState = {
  loading: boolean;

  entries: GuideEntryType[];
};

const initialState: UpdatesState = {
  loading: false,

  entries: [],
};

export const guidesSlice = createSlice({
  name: "guides",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setEntries: (state, action: PayloadAction<GuideEntryType[]>) => {
      state.entries = action.payload;
    },
  },
});

export const { setLoading, setEntries } = guidesSlice.actions;

export const selectLoading = (state: RootState) => state.guides.loading;

export const selectEntries = (state: RootState) => state.guides.entries;

export default guidesSlice.reducer;
