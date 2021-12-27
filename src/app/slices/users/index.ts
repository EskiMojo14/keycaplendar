import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { sortProps } from "@s/users/constants";
import type { RootState } from "~/app/store";
import { UserType } from "./types";

type UserState = {
  view: "card" | "table";
  loading: boolean;
  sort: typeof sortProps[number];
  reverseSort: boolean;

  allUsers: UserType[];
  sortedUsers: UserType[];
  paginatedUsers: UserType[];

  nextPageToken: string;
  rowsPerPage: number;
  page: number;
  indices: {
    first: number;
    last: number;
  };
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
  indices: {
    first: 0,
    last: 0,
  },
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
    setSort: (state, { payload }: PayloadAction<typeof sortProps[number]>) => {
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
    setIndices: (state, { payload }: PayloadAction<{ first: number; last: number }>) => {
      state.indices = payload;
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

export const selectIndices = (state: RootState) => state.users.indices;

export default usersSlice.reducer;
