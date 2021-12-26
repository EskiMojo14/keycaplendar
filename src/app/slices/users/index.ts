import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
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

export const initialState: UserState = {
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
    setView: (state, { payload }: PayloadAction<"card" | "table">) => {
      state.view = payload;
    },
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setSort: (state, { payload }: PayloadAction<keyof UserType>) => {
      state.sort = payload;
    },
    setReverseSort: (state, { payload }: PayloadAction<boolean>) => {
      state.reverseSort = payload;
    },
    setAllUsers: (state, { payload }: PayloadAction<UserType[]>) => {
      state.allUsers = payload;
    },
    setSortedUsers: (state, { payload }: PayloadAction<UserType[]>) => {
      state.sortedUsers = payload;
    },
    setPaginatedUsers: (state, { payload }: PayloadAction<UserType[]>) => {
      state.paginatedUsers = payload;
    },
    setNextPageToken: (state, { payload }: PayloadAction<string>) => {
      state.nextPageToken = payload;
    },
    setRowsPerPage: (state, { payload }: PayloadAction<number>) => {
      state.rowsPerPage = payload;
    },
    setPage: (state, { payload }: PayloadAction<number>) => {
      state.page = payload;
    },
    setIndices: (state, { payload: { first, last } }: PayloadAction<{ first: number; last: number }>) => {
      state.firstIndex = first;
      state.lastIndex = last;
    },
  },
});

export const {
  actions: {
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
  },
} = usersSlice;

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
