import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import type { GuideEntryType } from "./types";

type UpdatesState = {
  loading: boolean;

  entries: GuideEntryType[];
  urlEntry: string;

  allTags: string[];
  filteredTag: string;
};

export const initialState: UpdatesState = {
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
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setEntries: (state, { payload }: PayloadAction<GuideEntryType[]>) => {
      state.entries = payload;
    },
    setURLEntry: (state, { payload }: PayloadAction<string>) => {
      state.urlEntry = payload;
    },
    setAllTags: (state, { payload }: PayloadAction<string[]>) => {
      state.allTags = payload;
    },
    setFilteredTag: (state, { payload }: PayloadAction<string>) => {
      state.filteredTag = payload;
    },
  },
});

export const {
  actions: { setLoading, setEntries, setURLEntry, setAllTags, setFilteredTag },
} = guidesSlice;

export const selectLoading = (state: RootState) => state.guides.loading;

export const selectEntries = (state: RootState) => state.guides.entries;

export const selectURLEntry = (state: RootState) => state.guides.urlEntry;

export const selectAllTags = (state: RootState) => state.guides.allTags;

export const selectFilteredTag = (state: RootState) => state.guides.filteredTag;

export default guidesSlice.reducer;
