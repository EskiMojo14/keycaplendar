import firebase from "../../../firebase";
import { queue } from "../../snackbarQueue";
import store from "../../store";
import { alphabeticalSortProp } from "../common/functions";
import { setEntries, setLoading } from "./guidesSlice";
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
  dispatch(setLoading(false));
};
