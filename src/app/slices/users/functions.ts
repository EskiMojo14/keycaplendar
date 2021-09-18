import { ChangeEvent } from "react";
import { is } from "typescript-is";
import firebase from "@s/firebase";
import { queue } from "~/app/snackbar-queue";
import store from "~/app/store";
import { alphabeticalSortCurried, alphabeticalSortPropCurried, hasKey } from "@s/util/functions";
import {
  setAllUsers,
  setIndices,
  setLoading,
  setNextPageToken,
  setPaginatedUsers,
  setSortedUsers,
  setPage as setPageFn,
  setReverseSort as setReverseUserSort,
  setRowsPerPage as setRowsPerPageFn,
  setSort as setUserSort,
  setView,
  selectAllUsers,
  selectSort,
  selectReverseSort,
  selectSortedUsers,
  selectPage,
  selectRowsPerPage,
  selectNextPageToken,
} from ".";
import { UserType } from "./types";

const { dispatch } = store;

const length = 1000;

export const getUsers = (append = false, state = store.getState()) => {
  const nextPageToken = selectNextPageToken(state);
  const allUsers = selectAllUsers(state);
  dispatch(setLoading(true));
  const listUsersFn = firebase.functions().httpsCallable("listUsers");
  listUsersFn({ length: length, nextPageToken: nextPageToken })
    .then((result) => {
      if (result) {
        if (result.data.error) {
          queue.notify({ title: result.data.error });
          dispatch(setLoading(false));
        } else {
          dispatch(setLoading(false));
          const newUsers = append ? [...allUsers, ...result.data.users] : [...result.data.users];
          dispatch(setAllUsers(newUsers));
          dispatch(setNextPageToken(result.data.nextPageToken ? result.data.nextPageToken : ""));
          sortUsers(store.getState());
        }
      }
    })
    .catch((error) => {
      queue.notify({ title: "Error listing users: " + error });
      dispatch(setLoading(false));
    });
};

export const sortUsers = (state = store.getState()) => {
  const users = selectAllUsers(state);
  const sort = selectSort(state);
  const reverseSort = selectReverseSort(state);
  const sortedUsers = [...users];
  sortedUsers.sort((a, b) => {
    if (hasKey(a, sort) && hasKey(b, sort)) {
      const aVal = a[sort];
      const bVal = b[sort];
      if (is<string>(aVal) && is<string>(bVal)) {
        if ((aVal === "" || bVal === "") && !(aVal === "" && bVal === "")) {
          return aVal === "" ? 1 : -1;
        }
        return (
          alphabeticalSortCurried(reverseSort)(aVal, bVal) ||
          alphabeticalSortPropCurried("nickname")(a, b) ||
          alphabeticalSortPropCurried("email")(a, b)
        );
      } else {
        if (aVal === null || bVal === null) {
          return aVal === null ? 1 : -1;
        }
        return (
          alphabeticalSortCurried(reverseSort)(aVal, bVal) ||
          alphabeticalSortPropCurried("nickname")(a, b) ||
          alphabeticalSortPropCurried("email")(a, b)
        );
      }
    } else {
      return 0;
    }
  });
  dispatch(setSortedUsers(sortedUsers));
  dispatch(setLoading(false));
  paginateUsers(store.getState());
};

export const paginateUsers = (state = store.getState()) => {
  const users = selectSortedUsers(state);
  const page = selectPage(state);
  const rowsPerPage = selectRowsPerPage(state);
  const paginatedUsers = users.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const firstIndex = users.indexOf(paginatedUsers[0]);
  const lastIndex = users.indexOf(paginatedUsers[paginatedUsers.length - 1]);
  dispatch(setPaginatedUsers(paginatedUsers));
  dispatch(setIndices({ first: firstIndex, last: lastIndex }));
};

export const setRowsPerPage = (e: ChangeEvent<HTMLInputElement>) => {
  const val = parseInt(e.target.value);
  dispatch(setRowsPerPageFn(val));
  dispatch(setPageFn(1));
  paginateUsers(store.getState());
};

export const setPage = (num: number) => {
  dispatch(setPageFn(num));
  paginateUsers(store.getState());
};

export const setViewIndex = (index: number) => {
  const views = ["card", "table"] as const;
  dispatch(setView(views[index]));
};

export const setSort = (sort: keyof UserType, state = store.getState()) => {
  const userSort = selectSort(state);
  const reverseUserSort = selectReverseSort(state);
  let reverseSort;
  if (sort === userSort) {
    reverseSort = !reverseUserSort;
  } else {
    reverseSort = false;
  }
  dispatch(setPageFn(1));
  dispatch(setUserSort(sort));
  dispatch(setReverseUserSort(reverseSort));
  sortUsers(store.getState());
};

export const setSortIndex = (index: number) => {
  const props = [
    "displayName",
    "email",
    "dateCreated",
    "lastSignIn",
    "lastActive",
    "nickname",
    "designer",
    "editor",
    "admin",
  ] as const;
  dispatch(setPageFn(1));
  dispatch(setUserSort(props[index]));
  dispatch(setReverseUserSort(false));
  sortUsers(store.getState());
};
