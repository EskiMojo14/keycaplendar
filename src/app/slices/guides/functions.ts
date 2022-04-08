import { queue } from "~/app/snackbar-queue";
import type { AppThunk } from "~/app/store";
import firebase from "@s/firebase";
import { setEntries, setLoading } from ".";

export const getEntries = (): AppThunk<Promise<void>> => async (dispatch) => {
  const cloudFn = firebase.functions().httpsCallable("getGuides");
  dispatch(setLoading(true));
  try {
    const result = await cloudFn();
    dispatch([setEntries(result.data), setLoading(false)]);
  } catch (error) {
    console.log(`Error getting data: ${error}`);
    queue.notify({ title: `Error getting data: ${error}` });
    dispatch(setLoading(false));
  }
};
