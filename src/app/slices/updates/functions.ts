import type { EntityId } from "@reduxjs/toolkit";
import { queue } from "~/app/snackbar-queue";
import store from "~/app/store";
import firestore from "@s/firebase/firestore";
import type { UpdateId } from "@s/firebase/types";
import { selectEntryById, setEntries, setLoading } from ".";
import type { UpdateEntryType } from "./types";

const { dispatch } = store;

export const getEntries = () => {
  dispatch(setLoading(true));
  firestore
    .collection("updates")
    .orderBy("date", "desc")
    .get()
    .then((querySnapshot) => {
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
    })
    .catch((error) => {
      dispatch(setLoading(false));
      console.log(`Error getting data: ${error}`);
      queue.notify({ title: `Error getting data: ${error}` });
    });
};

export const pinEntry = (entryId: EntityId, state = store.getState()) => {
  const entry = selectEntryById(state, entryId);
  firestore
    .collection("updates")
    .doc(entryId as UpdateId)
    .set({ pinned: !entry?.pinned }, { merge: true })
    .then(() => {
      queue.notify({
        title: `Entry ${entry?.pinned ? "unpinned" : "pinned"}.`,
      });
      getEntries();
    })
    .catch((error) => {
      console.log(
        `Failed to ${entry?.pinned ? "unpin" : "pin"} entry: ${error}`
      );
      queue.notify({
        title: `Failed to ${entry?.pinned ? "unpin" : "pin"} entry: ${error}`,
      });
    });
};
