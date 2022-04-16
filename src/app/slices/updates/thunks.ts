import type { EntityId } from "@reduxjs/toolkit";
import { notify } from "~/app/snackbar-queue";
import type { AppThunk } from "~/app/store";
import firestore from "@s/firebase/firestore";
import type { UpdateId } from "@s/firebase/types";
import { selectEntryById, setEntries, setLoading } from ".";
import type { UpdateEntryType } from "./types";

export const getEntries = (): AppThunk<Promise<void>> => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const querySnapshot = await firestore
      .collection("updates")
      .orderBy("date", "desc")
      .get();

    const entries: UpdateEntryType[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        ...data,
        id: doc.id,
        pinned: data.pinned ?? false,
      });
    });
    dispatch([setEntries(entries), setLoading(false)]);
  } catch (error) {
    dispatch(setLoading(false));
    console.log(`Error getting data: ${error}`);
    notify({ title: `Error getting data: ${error}` });
  }
};

export const pinEntry =
  (entryId: EntityId): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const entry = selectEntryById(getState(), entryId);
    try {
      await firestore
        .collection("updates")
        .doc(entryId as UpdateId)
        .set({ pinned: !entry?.pinned }, { merge: true });
      notify({
        title: `Entry ${entry?.pinned ? "unpinned" : "pinned"}.`,
      });
      await dispatch(getEntries());
    } catch (error) {
      console.log(
        `Failed to ${entry?.pinned ? "unpin" : "pin"} entry: ${error}`
      );
      notify({
        title: `Failed to ${entry?.pinned ? "unpin" : "pin"} entry: ${error}`,
      });
    }
  };
