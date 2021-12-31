import produce from "immer";
import { DateTime } from "luxon";
import { queue } from "~/app/snackbar-queue";
import store from "~/app/store";
import firebase from "@s/firebase";
import {
  alphabeticalSortPropCurried,
  hasKey,
  ordinal,
} from "@s/util/functions";
import {
  selectData,
  selectSort,
  selectTab,
  setLoading,
  setStatisticsData,
  setStatisticsSetting,
  setStatisticsSort,
  setStatsTab,
} from ".";
import { categories, properties } from "./constants";
import type { StatisticsSortType, StatisticsType, StatsTab } from "./types";

const storage = firebase.storage();

const { dispatch } = store;

export const getData = async () => {
  const fileRef = storage.ref("statisticsData.json");
  dispatch(setLoading(true));
  fileRef
    .getDownloadURL()
    .then((url) => {
      fetch(url)
        .then((response) => {
          response.json().then((data) => {
            const { timestamp, ...statisticsData } = data;
            const luxonTimetamp = DateTime.fromISO(timestamp, { zone: "utc" });
            const timestampOrdinal = ordinal(luxonTimetamp.day);
            const formattedTimestamp = luxonTimetamp.toFormat(
              `HH:mm d'${timestampOrdinal}' MMM yyyy 'UTC'`
            );
            queue.notify({
              timeout: 4000,
              title: "Last updated: " + formattedTimestamp,
            });
            dispatch(setStatisticsData(statisticsData));
            dispatch(setLoading(false));
          });
        })
        .catch((error) => {
          console.log(error);
          dispatch(setLoading(false));
          queue.notify({ title: "Failed to fetch statistics data: " + error });
        });
    })
    .catch((error) => {
      console.log(error);
      dispatch(setLoading(false));
      queue.notify({ title: "Failed to create statistics data: " + error });
    });
};

export const sortData = (state = store.getState()) => {
  const tab = selectTab(state);
  const statisticsData = selectData(state);
  const sort = selectSort(state);
  if (tab !== "summary") {
    dispatch(setLoading(true));
    const sortedData = produce(statisticsData, (statisticsDataDraft) => {
      if (tab === "duration") {
        categories.forEach((category) => {
          properties.forEach((property) => {
            statisticsDataDraft[tab][category].breakdown[property].sort(
              (a, b) => {
                const key =
                  sort[tab] === "alphabetical"
                    ? "name"
                    : sort[tab] === "duration"
                    ? "mean"
                    : "total";
                return (
                  alphabeticalSortPropCurried(
                    key,
                    sort[tab] !== "alphabetical"
                  )(a, b) || alphabeticalSortPropCurried("name")(a, b)
                );
              }
            );
          });
        });
      } else if (tab === "timelines") {
        categories.forEach((category) => {
          properties.forEach((property) => {
            statisticsDataDraft[tab][category].breakdown[property].sort(
              (a, b) => {
                const key = sort[tab] === "alphabetical" ? "name" : "total";
                return (
                  alphabeticalSortPropCurried(
                    key,
                    sort[tab] !== "alphabetical"
                  )(a, b) || alphabeticalSortPropCurried("name")(a, b)
                );
              }
            );
          });
        });
      } else {
        properties.forEach((properties) => {
          statisticsDataDraft[tab].breakdown[properties].sort((a, b) => {
            if (hasKey(sort, tab)) {
              const key = sort[tab] === "total" ? "total" : "name";
              return (
                alphabeticalSortPropCurried(key, sort[tab] === "total")(a, b) ||
                alphabeticalSortPropCurried(key)(a, b)
              );
            }
            return 0;
          });
        });
      }
    });
    dispatch(setStatisticsData(sortedData));
    dispatch(setLoading(false));
  }
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
      params.delete("statisticsTab");
      const questionParam = params.has("page") ? "?" + params.toString() : "/";
      window.history.pushState({}, "KeycapLendar", questionParam);
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
  sortData();
};
