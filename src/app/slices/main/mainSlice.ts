import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { SortOrderType, SortType } from "./types";

type MainState = {
  transition: boolean;
  loading: boolean;
  content: boolean;

  sort: SortType;
  sortOrder: SortOrderType;
};

const initialState: MainState = {
  // state
  transition: false,
  loading: false,
  content: true,

  // sorts
  sort: "gbLaunch",
  sortOrder: "ascending",
};

export const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    setTransition: (state, action: PayloadAction<boolean>) => {
      state.transition = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setContent: (state, action: PayloadAction<boolean>) => {
      state.content = action.payload;
    },
    setSort: (state, action: PayloadAction<SortType>) => {
      state.sort = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<SortOrderType>) => {
      state.sortOrder = action.payload;
    },
  },
});

export const { setTransition, setLoading, setContent, setSort, setSortOrder } = mainSlice.actions;

export const selectTransition = (state: RootState) => state.main.transition;

export const selectLoading = (state: RootState) => state.main.loading;

export const selectContent = (state: RootState) => state.main.content;

export const selectSort = (state: RootState) => state.main.sort;

export const selectSortOrder = (state: RootState) => state.main.sortOrder;

export default mainSlice.reducer;
