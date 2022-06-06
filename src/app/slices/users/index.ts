import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { combineListeners } from "@mw/listener/functions";
import baseApi from "@s/api";
import { createErrorMessagesListener } from "@s/api/functions";
import firebase from "@s/firebase";
import type { sortProps } from "@s/users/constants";
import {
  alphabeticalSortCurried,
  alphabeticalSortPropCurried,
} from "@s/util/functions";
import type { CustomClaims, UserType } from "./types";

export const defaultUserLength = 1000;

const userAdapter = createEntityAdapter<UserType>();

const listUsers = firebase.functions().httpsCallable("listUsers");
const deleteUser = firebase.functions().httpsCallable("deleteUser");
const setRoles = firebase.functions().httpsCallable("setRoles");

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    deleteUser: build.mutation<
      string,
      { user: UserType; length?: number; nextPageToken?: string }
    >({
      onQueryStarted: async (
        { length, nextPageToken, user: { id } },
        { dispatch, queryFulfilled }
      ) => {
        try {
          await queryFulfilled;
          dispatch(
            usersApi.util.updateQueryData(
              "getUsers",
              { length, nextPageToken },
              (draftState) => {
                userAdapter.removeOne(draftState.users, id);
              }
            )
          );
        } catch (e) {}
      },
      queryFn: async (user) => {
        try {
          const result = await deleteUser(user);

          return { data: result.data };
        } catch (error) {
          return { error };
        }
      },
    }),
    getUsers: build.query<
      { users: EntityState<UserType>; nextPageToken?: string },
      { length?: number; nextPageToken?: string } | undefined
    >({
      queryFn: async ({ length = defaultUserLength, nextPageToken } = {}) => {
        try {
          const result = await listUsers({ length, nextPageToken });
          return {
            data: {
              nextPageToken: result.data.nextPageToken,
              users: userAdapter.setAll(
                userAdapter.getInitialState(),
                result.data.users
              ),
            },
          };
        } catch (error) {
          return { error };
        }
      },
    }),
    setRoles: build.mutation<
      CustomClaims,
      {
        claims: CustomClaims & { id: string };
        length?: number;
        nextPageToken?: string;
      }
    >({
      onQueryStarted: async (
        { claims: { id, ...claims }, length, nextPageToken },
        { dispatch, queryFulfilled }
      ) => {
        try {
          await queryFulfilled;
          dispatch(
            usersApi.util.updateQueryData(
              "getUsers",
              { length, nextPageToken },
              (draftState) => {
                if (draftState.users.entities[id]) {
                  Object.assign(draftState.users.entities[id], claims);
                }
              }
            )
          );
        } catch (e) {}
      },
      queryFn: async ({ claims }) => {
        try {
          const result = await setRoles(claims);

          return { data: result.data };
        } catch (error) {
          return { error };
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const { useDeleteUserMutation, useGetUsersQuery, useSetRolesMutation } =
  usersApi;

export const setupUsersListeners = combineListeners((startListening) => [
  createErrorMessagesListener(
    usersApi.endpoints,
    {
      deleteUser: "Failed to delete user",
      getUsers: "Failed to get users",
      setRoles: "Failed to set roles",
    },
    startListening
  ),
]);

type UserState = {
  page: number;
  reverseSort: boolean;
  rowsPerPage: number;
  sort: typeof sortProps[number];
  view: "card" | "table";
};

export const initialState: UserState = {
  page: 1,
  reverseSort: false,
  rowsPerPage: 25,
  sort: "editor",
  view: "table",
};

export const usersSlice = createSlice({
  initialState,
  name: "users",
  reducers: {
    pageChange: (state, { payload }: PayloadAction<number>) => {
      state.page = payload;
    },
    rowsPerPageChange: (state, { payload }: PayloadAction<number>) => {
      state.rowsPerPage = payload;
      state.page = 1;
    },
    sortChange: (
      state,
      { payload }: PayloadAction<typeof sortProps[number]>
    ) => {
      state.reverseSort = state.sort === payload ? !state.reverseSort : false;
      state.sort = payload;
      state.page = 1;
    },
    viewChange: (state, { payload }: PayloadAction<"card" | "table">) => {
      state.view = payload;
    },
  },
});

export const {
  actions: { pageChange, rowsPerPageChange, sortChange, viewChange },
} = usersSlice;

export const selectView = (state: RootState) => state.users.view;

export const selectSort = (state: RootState) => state.users.sort;

export const selectReverseSort = (state: RootState) => state.users.reverseSort;

export const selectRowsPerPage = (state: RootState) => state.users.rowsPerPage;

export const selectPage = (state: RootState) => state.users.page;

export const selectSortedUsers = createSelector(
  (data: EntityState<UserType>) => data,
  (_: unknown, sort: typeof sortProps[number]) => sort,
  (_: unknown, __: unknown, reverseSort: boolean) => reverseSort,
  (entityState, sort, reverseSort) => ({
    ...entityState,
    ids: Object.values(entityState.entities)
      .sort((a, b) => {
        if (a && b) {
          const { [sort]: aVal } = a;
          const { [sort]: bVal } = b;
          if (typeof aVal === "string" && typeof bVal === "string") {
            if ((aVal === "" || bVal === "") && !(aVal === "" && bVal === "")) {
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
                typeof aVal === "boolean" && typeof bVal === "boolean"
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
      .map((user) => userAdapter.selectId(user!)),
  })
);

const { selectAll, selectEntities, selectIds, selectTotal } =
  userAdapter.getSelectors();

export const selectUserIds = createSelector(selectSortedUsers, selectIds);
export const selectUserMap = createSelector(selectSortedUsers, selectEntities);
export const selectUserTotal = createSelector(selectSortedUsers, selectTotal);
export const selectUsers = createSelector(selectSortedUsers, selectAll);
export const selectUserById = createSelector(
  selectUserMap,
  (_: unknown, __: unknown, ___: unknown, id: EntityId) => id,
  (userMap, id) => userMap[id]
);

export const selectUserByEmail = createSelector(
  selectAll,
  (_: unknown, email: string) => email,
  (users, email) => users.find((user) => user.email === email)
);

export default usersSlice.reducer;
