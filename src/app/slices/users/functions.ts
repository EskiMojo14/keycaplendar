import type { EntityId } from "@reduxjs/toolkit";
import { queue } from "~/app/snackbar-queue";
import type { AppThunk } from "~/app/store";
import firebase from "@s/firebase";
import {
  appendUsers,
  selectNextPageToken,
  setLoading,
  setNextPageToken,
  setUsers,
} from ".";

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

export const getUsers =
  (append = false): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const nextPageToken = selectNextPageToken(getState());
    dispatch(setLoading(true));
    const listUsersFn = firebase.functions().httpsCallable("listUsers");
    try {
      const result = await listUsersFn({ length, nextPageToken });
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
    } catch (error) {
      queue.notify({ title: `Error listing users: ${error}` });
      dispatch(setLoading(false));
    }
  };
