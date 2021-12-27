import produce from "immer";
import { is } from "typescript-is";
import { queue } from "~/app/snackbar-queue";
import store from "~/app/store";
import firebase from "@s/firebase";
import { sortProps, views } from "@s/users/constants";
import { alphabeticalSortCurried, alphabeticalSortPropCurried, hasKey } from "@s/util/functions";
import {
  selectAllUsers,
  selectNextPageToken,
  selectPage,
  selectReverseSort,
  selectRowsPerPage,
  selectSort,
  selectSortedUsers,
  setAllUsers,
  setIndices,
  setLoading,
  setNextPageToken,
  setPage as setPageFn,
  setPaginatedUsers,
  setReverseSort as setReverseUserSort,
  setRowsPerPage as setRowsPerPageFn,
  setSortedUsers,
  setSort as setUserSort,
  setView,
} from ".";

const { dispatch } = store;

const length = 1000;

export const getUsers = (append = false, state = store.getState()) => {
  const nextPageToken = selectNextPageToken(state);
  const allUsers = selectAllUsers(state);
  dispatch(setLoading(true));
  const listUsersFn = firebase.functions().httpsCallable("listUsers");
  listUsersFn({ length, nextPageToken })
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
  const sortedUsers = produce(users, (draftUsers) => {
    draftUsers.sort((a, b) => {
      if (hasKey(a, sort) && hasKey(b, sort)) {
        const { [sort]: aVal } = a;
        const { [sort]: bVal } = b;
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
          if ((aVal === null || bVal === null) && !(aVal === null && bVal === null)) {
            return aVal === null ? 1 : -1;
          }
          return (
            alphabeticalSortCurried(is<boolean>(aVal) && is<boolean>(bVal) ? !reverseSort : reverseSort)(aVal, bVal) ||
            alphabeticalSortPropCurried("nickname")(a, b) ||
            alphabeticalSortPropCurried("email")(a, b)
          );
        }
      } else {
        return 0;
      }
    });
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
  const first = users.indexOf(paginatedUsers[0]);
  const last = users.indexOf(paginatedUsers[paginatedUsers.length - 1]);
  dispatch(setPaginatedUsers(paginatedUsers));
  dispatch(setIndices({ first, last }));
};

export const setRowsPerPage = (val: number) => {
  dispatch(setRowsPerPageFn(val));
  dispatch(setPageFn(1));
  paginateUsers(store.getState());
};

export const setPage = (num: number) => {
  dispatch(setPageFn(num));
  paginateUsers(store.getState());
};

export const setViewIndex = (index: number) => {
  dispatch(setView(views[index]));
};

export const setSort = (sort: typeof sortProps[number], state = store.getState()) => {
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
  dispatch(setPageFn(1));
  dispatch(setUserSort(sortProps[index]));
  dispatch(setReverseUserSort(false));
  sortUsers(store.getState());
};
