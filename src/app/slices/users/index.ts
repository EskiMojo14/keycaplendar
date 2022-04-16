import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { EntityState, PayloadAction } from "@reduxjs/toolkit";
import produce from "immer";
import { is } from "typescript-is";
import type { RootState } from "~/app/store";
import type { sortProps } from "@s/users/constants";
import {
  alphabeticalSortCurried,
  alphabeticalSortPropCurried,
} from "@s/util/functions";
import type { UserType } from "./types";

const userAdapter = createEntityAdapter<UserType>();

type UserState = {
  loading: boolean;
  nextPageToken: string;
  page: number;
  reverseSort: boolean;
  rowsPerPage: number;
  sort: typeof sortProps[number];
  users: EntityState<UserType>;
  view: "card" | "table";
};

export const initialState: UserState = {
  loading: false,
  nextPageToken: "",
  page: 1,
  reverseSort: false,
  rowsPerPage: 25,
  sort: "editor",
  users: userAdapter.getInitialState(),
  view: "table",
};

export const usersSlice = createSlice({
  initialState,
  name: "users",
  reducers: {
    appendUsers: (state, { payload }: PayloadAction<UserType[]>) => {
      userAdapter.addMany(state.users, payload);
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
    setRowsPerPage: (state, { payload }: PayloadAction<number>) => {
      state.rowsPerPage = payload;
      state.page = 1;
    },
    setSort: (state, { payload }: PayloadAction<typeof sortProps[number]>) => {
      state.reverseSort = state.sort === payload ? !state.reverseSort : false;
      state.sort = payload;
      state.page = 1;
    },
    setUsers: (state, { payload }: PayloadAction<UserType[]>) => {
      userAdapter.setAll(state.users, payload);
    },
    setView: (state, { payload }: PayloadAction<"card" | "table">) => {
      state.view = payload;
    },
  },
});

export const {
  actions: {
    appendUsers,
    setLoading,
    setNextPageToken,
    setPage,
    setRowsPerPage,
    setSort,
    setUsers,
    setView,
  },
} = usersSlice;

export const selectView = (state: RootState) => state.users.view;

export const selectLoading = (state: RootState) => state.users.loading;

export const selectSort = (state: RootState) => state.users.sort;

export const selectReverseSort = (state: RootState) => state.users.reverseSort;

export const selectNextPageToken = (state: RootState) =>
  state.users.nextPageToken;

export const selectRowsPerPage = (state: RootState) => state.users.rowsPerPage;

export const selectPage = (state: RootState) => state.users.page;

export const selectSortedUsers = createSelector(
  (state: RootState) => state.users.users,
  selectSort,
  selectReverseSort,
  (entityState, sort, reverseSort) =>
    produce(entityState, (draftEntityState) => {
      draftEntityState.ids = Object.values(draftEntityState.entities)
        .sort((a, b) => {
          if (a && b) {
            const { [sort]: aVal } = a;
            const { [sort]: bVal } = b;
            if (is<string>(aVal) && is<string>(bVal)) {
              if (
                (aVal === "" || bVal === "") &&
                !(aVal === "" && bVal === "")
              ) {
                return aVal === "" ? 1 : -1;
              }
              return (
                alphabeticalSortCurried(reverseSort)(aVal, bVal) ||
                alphabeticalSortPropCurried("nickname")(a, b) ||
                alphabeticalSortPropCurried("email")(a, b)
              );
            } else {
              if (
                (aVal === null || bVal === null) &&
                !(aVal === null && bVal === null)
              ) {
                return aVal === null ? 1 : -1;
              }
              return (
                alphabeticalSortCurried(
                  is<boolean>(aVal) && is<boolean>(bVal)
                    ? !reverseSort
                    : reverseSort
                )(aVal, bVal) ||
                alphabeticalSortPropCurried("nickname")(a, b) ||
                alphabeticalSortPropCurried("email")(a, b)
              );
            }
          }
          return 0;
        })
        .map((user) => userAdapter.selectId(user!));
    })
);

export const {
  selectAll: selectUsers,
  selectById: selectUserById,
  selectEntities: selectUserMap,
  selectIds: selectUserIds,
  selectTotal: selectUserTotal,
} = userAdapter.getSelectors<RootState>(selectSortedUsers);

export default usersSlice.reducer;
