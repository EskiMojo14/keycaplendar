import firebase from "@s/firebase";
import { queue } from "~/app/snackbarQueue";
import store from "~/app/store";
import { alphabeticalSort, alphabeticalSortProp, uniqueArray } from "@s/common/functions";
import { setAllTags, setEntries, setLoading } from "./guidesSlice";
import { GuideEntryType } from "./types";

const { dispatch } = store;

export const getEntries = () => {
  const cloudFn = firebase.functions().httpsCallable("getGuides");
  dispatch(setLoading(true));
  cloudFn()
    .then((result) => {
      const entries: GuideEntryType[] = result.data;
      sortEntries(entries);
    })
    .catch((error) => {
      console.log("Error getting data: " + error);
      queue.notify({ title: "Error getting data: " + error });
    });
};

const sortEntries = (entries: GuideEntryType[]) => {
  const sortedEntries = alphabeticalSortProp(entries, "title", false, "Welcome to KeycapLendar!");
  dispatch(setEntries(sortedEntries));
  const allTags = alphabeticalSort(uniqueArray(sortedEntries.map((entry) => entry.tags).flat(1)));
  dispatch(setAllTags(allTags));
  dispatch(setLoading(false));
};
