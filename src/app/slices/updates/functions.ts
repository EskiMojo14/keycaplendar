import { queue } from "~/app/snackbar-queue";
import store from "~/app/store";
import firestore from "@s/firebase/firestore";
import type { UpdateId } from "@s/firebase/types";
import { alphabeticalSortPropCurried } from "@s/util/functions";
import { setEntries, setLoading } from ".";
import type { UpdateEntryType } from "./types";

const { dispatch } = store;

export const sortEntries = (entries: UpdateEntryType[]) => {
  const sortedEntries = entries.sort((a, b) => {
    if ((a.pinned || b.pinned) && !(a.pinned && b.pinned)) {
      return a.pinned ? -1 : 1;
    }
    return (
      alphabeticalSortPropCurried<UpdateEntryType, "date">("date", true)(
        a,
        b
      ) || alphabeticalSortPropCurried<UpdateEntryType, "title">("title")(a, b)
    );
  });
  dispatch(setEntries(sortedEntries));
  dispatch(setLoading(false));
};

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
          pinned: data.pinned ? data.pinned : false,
        });
      });
      sortEntries(entries);
    })
    .catch((error) => {
      console.log("Error getting data: " + error);
      queue.notify({ title: "Error getting data: " + error });
    });
};

export const pinEntry = (entry: UpdateEntryType) => {
  firestore
    .collection("updates")
    .doc(entry.id as UpdateId)
    .set({ pinned: !entry.pinned }, { merge: true })
    .then(() => {
      queue.notify({ title: `Entry ${entry.pinned ? "unpinned" : "pinned"}.` });
      getEntries();
    })
    .catch((error) => {
      console.log(
        `Failed to ${entry.pinned ? "unpin" : "pin"} entry: ${error}`
      );
      queue.notify({
        title: `Failed to ${entry.pinned ? "unpin" : "pin"} entry: ${error}`,
      });
    });
};
