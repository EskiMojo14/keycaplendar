import { DateTime } from "luxon";
import firebase from "@s/firebase";
import cloneDeep from "lodash.clonedeep";
import store from "~/app/store";
import { queue } from "~/app/snackbarQueue";
import { alphabeticalSortPropCurried, hasKey, mergeObject, ordinal } from "@s/util/functions";
import {
  setStatisticsData,
  setLoading,
  setStatisticsSetting,
  setStatisticsSort,
  setStatsTab,
  selectTab,
  selectData,
  selectSort,
} from ".";
import { Properties, StatisticsData, StatisticsSortType, StatisticsType, StatsTab } from "./types";
import { categories, properties } from "./constants";

const storage = firebase.storage();

const { dispatch } = store;

export const setStatisticsTab = (tab: StatsTab, clearUrl = true, state = store.getState()) => {
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

export const setSetting = <T extends keyof StatisticsType>(prop: T, value: StatisticsType[T]) => {
  dispatch(setStatisticsSetting({ key: prop, value: value }));
};

export const setSort = <T extends keyof StatisticsSortType>(prop: T, value: StatisticsSortType[T]) => {
  dispatch(setStatisticsSort({ key: prop, value: value }));
  sortData();
};

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
            const formattedTimestamp = luxonTimetamp.toFormat(`HH:mm d'${timestampOrdinal}' MMM yyyy 'UTC'`);
            queue.notify({ title: "Last updated: " + formattedTimestamp, timeout: 4000 });
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
  const statisticsTab = selectTab(state);
  const statisticsData = selectData(state);
  const sort = selectSort(state);
  if (statisticsTab !== "summary") {
    dispatch(setLoading(true));
    const tab = statisticsTab;
    const setData = (data: StatisticsData[keyof StatisticsData]) => {
      dispatch(setStatisticsData(mergeObject(statisticsData, { [tab]: data })));
      dispatch(setLoading(false));
    };
    const stateData = statisticsData[tab];
    if (tab === "duration") {
      const data = cloneDeep(stateData) as StatisticsData["duration"];
      categories.forEach((category) => {
        properties.forEach((property) => {
          const value = data[category].breakdown[property];
          const sortedValue = value.slice().sort((a, b) => {
            const key = sort[tab] === "alphabetical" ? "name" : sort[tab] === "duration" ? "mean" : "total";
            return (
              alphabeticalSortPropCurried(key, sort[tab] !== "alphabetical")(a, b) ||
              alphabeticalSortPropCurried("name")(a, b)
            );
          });
          data[category].breakdown[property] = sortedValue;
        });
      });
      setData(data);
    } else if (tab === "timelines") {
      const data = cloneDeep(stateData) as StatisticsData["timelines"];
      categories.forEach((category) => {
        properties.forEach((property) => {
          const value = data[category].breakdown[property];
          const sortedValue = value.slice().sort((a, b) => {
            const key = sort[tab] === "alphabetical" ? "name" : "total";
            return (
              alphabeticalSortPropCurried(key, sort[tab] !== "alphabetical")(a, b) ||
              alphabeticalSortPropCurried("name")(a, b)
            );
          });
          data[category].breakdown[property] = sortedValue;
        });
      });
      setData(data);
    } else {
      const data = cloneDeep(stateData) as Omit<StatisticsData, "duration" | "timelines">[keyof Omit<
        StatisticsData,
        "duration" | "timelines"
      >];
      properties.forEach((properties) => {
        const value = data.breakdown[properties];
        type DataObj = typeof data.breakdown[Properties][number];
        const sortedValue = value.slice().sort((a: DataObj, b: DataObj) => {
          if (hasKey(sort, tab)) {
            const key = sort[tab] === "total" ? "total" : "name";
            return (
              alphabeticalSortPropCurried(key, sort[tab] === "total")(a, b) || alphabeticalSortPropCurried(key)(a, b)
            );
          }
          return 0;
        });
        data.breakdown[properties] = sortedValue;
      });
      setData(data);
    }
  }
};
