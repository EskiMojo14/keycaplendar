import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import type { sortProps } from "@s/users/constants";
import type { UserType } from "./types";

type UserState = {
  allUsers: UserType[];
  indices: {
    first: number;
    last: number;
  };
  loading: boolean;
  nextPageToken: string;
  page: number;
  paginatedUsers: UserType[];
  reverseSort: boolean;
  rowsPerPage: number;
  sort: typeof sortProps[number];
  sortedUsers: UserType[];
  view: "card" | "table";
};

export const initialState: UserState = {
  allUsers: [],
  indices: {
    first: 0,
    last: 0,
  },
  loading: false,
  nextPageToken: "",
  page: 1,
  paginatedUsers: [],
  reverseSort: false,
  rowsPerPage: 25,
  sort: "editor",
  sortedUsers: [],
  view: "table",
};

export const usersSlice = createSlice({
  initialState,
  name: "users",
  reducers: {
    setAllUsers: (state, { payload }: PayloadAction<UserType[]>) => {
      state.allUsers = payload;
    },
    setIndices: (
      state,
      { payload }: PayloadAction<{ first: number; last: number }>
    ) => {
      state.indices = payload;
    },
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setNextPageToken: (state, { payload }: PayloadAction<string>) => {
      state.nextPageToken = payload;
    },
    setPage: (state, { payload }: PayloadAction<number>) => {
      state.page = payload;
    },
    setPaginatedUsers: (state, { payload }: PayloadAction<UserType[]>) => {
      state.paginatedUsers = payload;
    },
    setReverseSort: (state, { payload }: PayloadAction<boolean>) => {
      state.reverseSort = payload;
    },
    setRowsPerPage: (state, { payload }: PayloadAction<number>) => {
      state.rowsPerPage = payload;
    },
    setSort: (state, { payload }: PayloadAction<typeof sortProps[number]>) => {
      state.sort = payload;
    },
    setSortedUsers: (state, { payload }: PayloadAction<UserType[]>) => {
      state.sortedUsers = payload;
    },
    setView: (state, { payload }: PayloadAction<"card" | "table">) => {
      state.view = payload;
    },
  },
});

export const {
  actions: {
    setAllUsers,
    setIndices,
    setLoading,
    setNextPageToken,
    setPage,
    setPaginatedUsers,
    setReverseSort,
    setRowsPerPage,
    setSort,
    setSortedUsers,
    setView,
  },
} = usersSlice;

export const selectView = (state: RootState) => state.users.view;

export const selectLoading = (state: RootState) => state.users.loading;

export const selectSort = (state: RootState) => state.users.sort;

export const selectReverseSort = (state: RootState) => state.users.reverseSort;

export const selectAllUsers = (state: RootState) => state.users.allUsers;

export const selectSortedUsers = (state: RootState) => state.users.sortedUsers;

export const selectPaginatedUsers = (state: RootState) =>
  state.users.paginatedUsers;

export const selectNextPageToken = (state: RootState) =>
  state.users.nextPageToken;

export const selectRowsPerPage = (state: RootState) => state.users.rowsPerPage;

export const selectPage = (state: RootState) => state.users.page;

export const selectIndices = (state: RootState) => state.users.indices;

export default usersSlice.reducer;
