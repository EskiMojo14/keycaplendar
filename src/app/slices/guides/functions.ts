import firebase from "../../../firebase";
import { queue } from "../../snackbarQueue";
import store from "../../store";
import { alphabeticalSortProp } from "../common/functions";
import { setEntries, setLoading } from "./guidesSlice";
import { GuideEntryType } from "./types";

const db = firebase.firestore();

const { dispatch } = store;

export const getEntries = () => {
  dispatch(setLoading(true));
  db.collection("guides")
    .get()
    .then((querySnapshot) => {
      const entries: GuideEntryType[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          name: data.name,
          tags: data.tags,
          visibility: data.visibility,
          title: data.title,
          body: data.body,
        });
      });
      sortEntries(entries);
    })
    .catch((error) => {
      console.log("Error getting data: " + error);
      queue.notify({ title: "Error getting data: " + error });
    });
};

const sortEntries = (entries: GuideEntryType[]) => {
  const sortedEntries = alphabeticalSortProp(entries, "title");
  dispatch(setEntries(sortedEntries));
  dispatch(setLoading(false));
};
