import { push } from "connected-react-router";
import { DateTime } from "luxon";
import { queue } from "~/app/snackbar-queue";
import store from "~/app/store";
import firebase from "@s/firebase";
import { createURL, ordinal } from "@s/util/functions";
import {
  selectTab,
  setLoading,
  setStatisticsData,
  setStatisticsSetting,
  setStatisticsSort,
  setStatsTab,
} from ".";
import type { StatisticsSortType, StatisticsType, StatsTab } from "./types";

const storage = firebase.storage();

const { dispatch } = store;

export const getData = async () => {
  const fileRef = storage.ref("statisticsData.json");
  dispatch(setLoading(true));
  fileRef
    .getDownloadURL()
    .then((url) =>
      fetch(url).then((response) =>
        response.json().then((data) => {
          const { timestamp, ...statisticsData } = data;
          const luxonTimetamp = DateTime.fromISO(timestamp, { zone: "utc" });
          const timestampOrdinal = ordinal(luxonTimetamp.day);
          const formattedTimestamp = luxonTimetamp.toFormat(
            `HH:mm d'${timestampOrdinal}' MMM yyyy 'UTC'`
          );
          queue.notify({
            timeout: 4000,
            title: `Last updated: ${formattedTimestamp}`,
          });
          dispatch([setStatisticsData(statisticsData), setLoading(false)]);
        })
      )
    )
    .catch((error) => {
      console.log(error);
      dispatch(setLoading(false));
      queue.notify({ title: `Failed to create statistics data: ${error}` });
    });
};

export const setStatisticsTab = (
  tab: StatsTab,
  clearUrl = true,
  state = store.getState()
) => {
  const statsTab = selectTab(state);
  dispatch(setStatsTab(tab));
  if (statsTab !== tab) {
    document.documentElement.scrollTop = 0;
  }
  if (clearUrl) {
    const params = new URLSearchParams(window.location.search);
    if (params.has("statisticsTab")) {
      const newUrl = createURL({}, (params) => {
        params.delete("statisticsTab");
      });
      dispatch(push(newUrl));
    }
  }
};

export const setSetting = <T extends keyof StatisticsType>(
  prop: T,
  value: StatisticsType[T]
) => {
  dispatch(setStatisticsSetting(prop, value));
};

export const setSort = <T extends keyof StatisticsSortType>(
  prop: T,
  value: StatisticsSortType[T]
) => {
  dispatch(setStatisticsSort(prop, value));
};
