import firebase from "../../../firebase";
import { queue } from "../../snackbarQueue";
import store from "../../store";
import { setEntries, setLoading } from "./updatesSlice";
import { UpdateEntryType } from "./types";

const db = firebase.firestore();

const { dispatch } = store;

export const getEntries = () => {
  dispatch(setLoading(true));
  db.collection("updates")
    .orderBy("date", "desc")
    .get()
    .then((querySnapshot) => {
      const entries: UpdateEntryType[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          name: data.name,
          title: data.title,
          date: data.date,
          body: data.body,
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

const sortEntries = (entries: UpdateEntryType[]) => {
  const sortedEntries = entries.sort((a, b) => {
    if ((a.pinned || b.pinned) && !(a.pinned && b.pinned)) {
      return a.pinned ? -1 : 1;
    } else {
      return a.date > b.date ? -1 : 1;
    }
  });
  dispatch(setEntries(sortedEntries));
  dispatch(setLoading(false));
};

export const pinEntry = (entry: UpdateEntryType) => {
  db.collection("updates")
    .doc(entry.id)
    .set({ pinned: !entry.pinned }, { merge: true })
    .then(() => {
      queue.notify({ title: `Entry ${entry.pinned ? "unpinned" : "pinned"}.` });
      getEntries();
    })
    .catch((error) => {
      console.log(`Failed to ${entry.pinned ? "unpin" : "pin"} entry: ${error}`);
      queue.notify({ title: `Failed to ${entry.pinned ? "unpin" : "pin"} entry: ${error}` });
    });
};
