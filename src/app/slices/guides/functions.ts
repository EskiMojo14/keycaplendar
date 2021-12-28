import { queue } from "~/app/snackbar-queue";
import store from "~/app/store";
import firebase from "@s/firebase";
import { alphabeticalSort, alphabeticalSortProp, removeDuplicates } from "@s/util/functions";
import { setAllTags, setEntries, setLoading } from ".";
import type { GuideEntryType } from "./types";

const { dispatch } = store;

export const getEntries = () => {
  const cloudFn = firebase.functions().httpsCallable("getGuides");
  dispatch(setLoading(true));
  cloudFn()
    .then(({ data: entries }) => {
      sortEntries(entries);
    })
    .catch((error) => {
      console.log("Error getting data: " + error);
      queue.notify({ title: "Error getting data: " + error });
    });
};

export const sortEntries = (entries: GuideEntryType[]) => {
  const sortedEntries = alphabeticalSortProp(entries, "title", false, "Welcome to KeycapLendar!");
  dispatch(setEntries(sortedEntries));
  const allTags = alphabeticalSort(removeDuplicates(sortedEntries.map((entry) => entry.tags).flat(1)));
  dispatch(setAllTags(allTags));
  dispatch(setLoading(false));
};
