import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { GuideEntryType } from "./types";

type UpdatesState = {
  loading: boolean;

  entries: GuideEntryType[];
  urlEntry: string;

  allTags: string[];
  filteredTag: string;
};

const initialState: UpdatesState = {
  loading: false,

  entries: [],
  urlEntry: "",

  allTags: [],
  filteredTag: "",
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
    setURLEntry: (state, action: PayloadAction<string>) => {
      state.urlEntry = action.payload;
    },
    setAllTags: (state, action: PayloadAction<string[]>) => {
      state.allTags = action.payload;
    },
    setFilteredTag: (state, action: PayloadAction<string>) => {
      state.filteredTag = action.payload;
    },
  },
});

export const { setLoading, setEntries, setURLEntry, setAllTags, setFilteredTag } = guidesSlice.actions;

export const selectLoading = (state: RootState) => state.guides.loading;

export const selectEntries = (state: RootState) => state.guides.entries;

export const selectURLEntry = (state: RootState) => state.guides.urlEntry;

export const selectAllTags = (state: RootState) => state.guides.allTags;

export const selectFilteredTag = (state: RootState) => state.guides.filteredTag;

export default guidesSlice.reducer;
