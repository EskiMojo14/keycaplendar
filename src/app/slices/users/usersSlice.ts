import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { UserType } from "./types";

type UserState = {
  view: "card" | "table";
  loading: boolean;
  sort: keyof UserType;
  reverseSort: boolean;

  allUsers: UserType[];
  sortedUsers: UserType[];
  paginatedUsers: UserType[];

  nextPageToken: string;
  rowsPerPage: number;
  page: number;
  firstIndex: number;
  lastIndex: number;
};

const initialState: UserState = {
  view: "table",
  loading: false,
  sort: "editor",
  reverseSort: false,
  // users
  allUsers: [],
  sortedUsers: [],
  paginatedUsers: [],
  // pagination
  nextPageToken: "",
  rowsPerPage: 25,
  page: 1,
  firstIndex: 0,
  lastIndex: 0,
};

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setView: (state, action: PayloadAction<"card" | "table">) => {
      state.view = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSort: (state, action: PayloadAction<keyof UserType>) => {
      state.sort = action.payload;
    },
    setReverseSort: (state, action: PayloadAction<boolean>) => {
      state.reverseSort = action.payload;
    },
    setAllUsers: (state, action: PayloadAction<UserType[]>) => {
      state.allUsers = action.payload;
    },
    setSortedUsers: (state, action: PayloadAction<UserType[]>) => {
      state.sortedUsers = action.payload;
    },
    setPaginatedUsers: (state, action: PayloadAction<UserType[]>) => {
      state.paginatedUsers = action.payload;
    },
    setNextPageToken: (state, action: PayloadAction<string>) => {
      state.nextPageToken = action.payload;
    },
    setRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setIndices: (state, action: PayloadAction<{ first: number; last: number }>) => {
      state.firstIndex = action.payload.first;
      state.lastIndex = action.payload.last;
    },
  },
});

export const {
  setView,
  setLoading,
  setSort,
  setReverseSort,
  setAllUsers,
  setSortedUsers,
  setPaginatedUsers,
  setNextPageToken,
  setRowsPerPage,
  setPage,
  setIndices,
} = usersSlice.actions;

export const selectView = (state: RootState) => state.users.view;

export const selectLoading = (state: RootState) => state.users.loading;

export const selectSort = (state: RootState) => state.users.sort;

export const selectReverseSort = (state: RootState) => state.users.reverseSort;

export const selectAllUsers = (state: RootState) => state.users.allUsers;

export const selectSortedUsers = (state: RootState) => state.users.sortedUsers;

export const selectPaginatedUsers = (state: RootState) => state.users.paginatedUsers;

export const selectNextPageToken = (state: RootState) => state.users.nextPageToken;

export const selectRowsPerPage = (state: RootState) => state.users.rowsPerPage;

export const selectPage = (state: RootState) => state.users.page;

export const selectFirstIndex = (state: RootState) => state.users.firstIndex;

export const selectLastIndex = (state: RootState) => state.users.lastIndex;

export default usersSlice.reducer;
