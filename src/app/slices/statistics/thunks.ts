import { DateTime } from "luxon";
import { notify } from "~/app/snackbar-queue";
import type { AppThunk } from "~/app/store";
import firebase from "@s/firebase";
import { push } from "@s/router";
import { createURL, ordinal } from "@s/util/functions";
import { selectTab, setLoading, setStatisticsData, setStatsTab } from ".";
import type { StatsTab } from "./types";

export const setStatisticsTab =
  (tab: StatsTab, clearUrl = true): AppThunk<void> =>
  (dispatch, getState) => {
    const statsTab = selectTab(getState());
    dispatch(setStatsTab(tab));
    if (statsTab !== tab) {
      document.documentElement.scrollTop = 0;
    }
    if (clearUrl) {
      const params = new URLSearchParams(window.location.search);
      if (params.has("statisticsTab")) {
        const newUrl = createURL(
          {},
          (params) => {
            params.delete("statisticsTab");
          },
          true
        );
        dispatch(push(newUrl));
      }
    }
  };

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
