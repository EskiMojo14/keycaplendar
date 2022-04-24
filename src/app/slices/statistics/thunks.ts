import { DateTime } from "luxon";
import { notify } from "~/app/snackbar-queue";
import type { AppThunk } from "~/app/store";
import firebase from "@s/firebase";
import { ordinal } from "@s/util/functions";
import { setLoading, setStatisticsData } from ".";

const storage = firebase.storage();

export const getData = (): AppThunk<Promise<void>> => async (dispatch) => {
  const fileRef = storage.ref("statisticsData.json");
  dispatch(setLoading(true));
  try {
    const url = await fileRef.getDownloadURL();
    const data = await (await fetch(url)).json();
    const { timestamp, ...statisticsData } = data;
    const luxonTimetamp = DateTime.fromISO(timestamp, { zone: "utc" });
    const timestampOrdinal = ordinal(luxonTimetamp.day);
    const formattedTimestamp = luxonTimetamp.toFormat(
      `HH:mm d'${timestampOrdinal}' MMM yyyy 'UTC'`
    );
    notify({
      timeout: 4000,
      title: `Last updated: ${formattedTimestamp}`,
    });
    dispatch([setStatisticsData(statisticsData), setLoading(false)]);
  } catch (error) {
    console.log(error);
    dispatch(setLoading(false));
    notify({ title: `Failed to create statistics data: ${error}` });
  }
};
