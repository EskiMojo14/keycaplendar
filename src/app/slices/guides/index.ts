import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import type { GuideEntryType } from "./types";

type UpdatesState = {
  allTags: string[];
  entries: GuideEntryType[];
  filteredTag: string;
  loading: boolean;
  urlEntry: string;
};

export const initialState: UpdatesState = {
  allTags: [],
  entries: [],
  filteredTag: "",
  loading: false,
  urlEntry: "",
};

export const guidesSlice = createSlice({
  initialState,
  name: "guides",
  reducers: {
    setAllTags: (state, { payload }: PayloadAction<string[]>) => {
      state.allTags = payload;
    },
    setEntries: (state, { payload }: PayloadAction<GuideEntryType[]>) => {
      state.entries = payload;
    },
    setFilteredTag: (state, { payload }: PayloadAction<string>) => {
      state.filteredTag = payload;
    },
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setURLEntry: (state, { payload }: PayloadAction<string>) => {
      state.urlEntry = payload;
    },
  },
});

export const {
  actions: { setAllTags, setEntries, setFilteredTag, setLoading, setURLEntry },
} = guidesSlice;

export const selectLoading = (state: RootState) => state.guides.loading;

export const selectEntries = (state: RootState) => state.guides.entries;

export const selectURLEntry = (state: RootState) => state.guides.urlEntry;

export const selectAllTags = (state: RootState) => state.guides.allTags;

export const selectFilteredTag = (state: RootState) => state.guides.filteredTag;

export default guidesSlice.reducer;
