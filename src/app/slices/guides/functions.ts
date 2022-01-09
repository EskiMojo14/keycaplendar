import { queue } from "~/app/snackbar-queue";
import store from "~/app/store";
import firebase from "@s/firebase";
import { setEntries, setLoading } from ".";
import type { GuideEntryType } from "./types";

const { dispatch } = store;

export const getEntries = () => {
  const cloudFn = firebase.functions().httpsCallable("getGuides");
  dispatch(setLoading(true));
  cloudFn()
    .then(({ data: entries }: { data: GuideEntryType[] }) => {
      dispatch(setEntries(entries));
    })
    .catch((error) => {
      console.log(`Error getting data: ${error}`);
      queue.notify({ title: `Error getting data: ${error}` });
    })
    .finally(() => {
      dispatch(setLoading(false));
    });
};
