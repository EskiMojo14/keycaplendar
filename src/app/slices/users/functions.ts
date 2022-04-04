import type { EntityId } from "@reduxjs/toolkit";
import { queue } from "~/app/snackbar-queue";
import store from "~/app/store";
import firebase from "@s/firebase";
import { sortProps, views } from "@s/users/constants";
import {
  appendUsers,
  selectNextPageToken,
  setLoading,
  setNextPageToken,
  setPage as setPageFn,
  setRowsPerPage as setRowsPerPageFn,
  setUsers,
  setSort as setUserSort,
  setView,
} from ".";

const { dispatch } = store;

const length = 1000;

export const paginateUsers = (
  ids: EntityId[],
  page: number,
  rowsPerPage: number
) => {
  const first = (page - 1) * rowsPerPage;
  const last = page * rowsPerPage - 1;
  const paginated = ids.slice(first, last + 1);
  return { first, ids: paginated, last: Math.min(last, ids.length - 1) };
};

export const getUsers = (append = false, state = store.getState()) => {
  const nextPageToken = selectNextPageToken(state);
  dispatch(setLoading(true));
  const listUsersFn = firebase.functions().httpsCallable("listUsers");
  listUsersFn({ length, nextPageToken })
    .then((result) => {
      if (result.data.error) {
        queue.notify({ title: result.data.error });
        dispatch(setLoading(false));
      } else {
        dispatch([
          setLoading(false),
          append ? appendUsers(result.data.users) : setUsers(result.data.users),
          setNextPageToken(result.data.nextPageToken ?? ""),
        ]);
      }
    })
    .catch((error) => {
      queue.notify({ title: `Error listing users: ${error}` });
      dispatch(setLoading(false));
    });
};

export const setRowsPerPage = (val: number) => dispatch(setRowsPerPageFn(val));

export const setPage = (num: number) => dispatch(setPageFn(num));

export const setViewIndex = (index: number) => dispatch(setView(views[index]));

export const setSort = (sort: typeof sortProps[number]) =>
  dispatch(setUserSort(sort));

export const setSortIndex = (index: number) =>
  dispatch(setUserSort(sortProps[index]));
