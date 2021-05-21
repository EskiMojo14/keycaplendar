import moment from "moment";
import firebase from "../../../firebase";
import store from "../../store";
import { queue } from "../../snackbarQueue";
import {
  setStatisticsData,
  setStatisticsDataCreated,
  setStatisticsSetting,
  setStatisticsSort,
  setStatsTab,
} from "./statisticsSlice";
import {
  DurationData,
  ShippedData,
  ShippedDataObject,
  StatisticsSortType,
  StatisticsType,
  StatsTab,
  StatusData,
  StatusDataObject,
  TimelinesData,
  VendorData,
  VendorDataObject,
} from "./types";
import { hasKey, mergeObject } from "../common/functions";
import { categories, properties } from "./constants";

const storage = firebase.storage();

export const setStatisticsTab = (tab: StatsTab, clearUrl = true) => {
  const { dispatch } = store;
  const {
    statistics: { tab: statsTab },
  } = store.getState();
  if (statsTab !== tab) {
    document.documentElement.scrollTop = 0;
    dispatch(setStatsTab(tab));
  }
  if (clearUrl) {
    const params = new URLSearchParams(window.location.search);
    params.delete("statisticsTab");
    const questionParam = params.has("page") ? "?" + params.toString() : "/";
    window.history.pushState({}, "KeycapLendar", questionParam);
  }
};

export const setSetting = <T extends keyof StatisticsType>(prop: T, value: StatisticsType[T]) => {
  const { dispatch } = store;
  dispatch(setStatisticsSetting({ key: prop, value: value }));
};

export const setSort = <T extends keyof StatisticsSortType>(prop: T, value: StatisticsSortType[T]) => {
  const { dispatch } = store;
  dispatch(setStatisticsSort({ key: prop, value: value }));
  sortData();
};

export const getData = async () => {
  const { dispatch } = store;
  const fileRef = storage.ref("statisticsData.json");
  fileRef
    .getDownloadURL()
    .then((url) => {
      fetch(url)
        .then((response) => {
          response.json().then((data) => {
            const { timestamp, ...statisticsData } = data;

            const formattedTimestamp = moment.utc(timestamp, moment.ISO_8601).format("HH:mm Do MMM YYYY UTC");
            queue.notify({ title: "Last updated: " + formattedTimestamp, timeout: 4000 });

            dispatch(setStatisticsData(statisticsData));
            dispatch(setStatisticsDataCreated(Object.keys(statisticsData)));
          });
        })
        .catch((error) => {
          console.log(error);
          queue.notify({ title: "Failed to fetch statistics data: " + error });
        });
    })
    .catch((error) => {
      console.log(error);
      queue.notify({ title: "Failed to create statistics data: " + error });
    });
};

export const sortData = () => {
  const { dispatch } = store;
  const {
    statistics: { tab: statisticsTab, data: statisticsData, sort },
  } = store.getState();
  const key = statisticsTab + "Data";
  if (hasKey(statisticsData, key)) {
    const stateData = statisticsData[key];
    const tab = statisticsTab;
    if (typeof stateData === "object") {
      if (tab === "duration") {
        const data = { ...stateData } as DurationData;
        categories.forEach((category) => {
          properties.forEach((property) => {
            const value = data[category][property];
            const sortedValue = value.slice().sort((a, b) => {
              if (a.name === "All" || b.name === "All") {
                return a.name === "all" ? -1 : 1;
              }
              const x =
                sort[tab] === "alphabetical" ? a.name.toLowerCase() : a[sort[tab] === "duration" ? "mean" : "total"];
              const y =
                sort[tab] === "alphabetical" ? b.name.toLowerCase() : b[sort[tab] === "duration" ? "mean" : "total"];
              const c = a.name.toLowerCase();
              const d = b.name.toLowerCase();
              if (x < y) {
                return sort[tab] === "alphabetical" ? -1 : 1;
              }
              if (x > y) {
                return sort[tab] === "alphabetical" ? 1 : -1;
              }
              if (c < d) {
                return -1;
              }
              if (c > d) {
                return 1;
              }
              return 0;
            });
            data[category][property] = sortedValue;
          });
        });
        dispatch(setStatisticsData(mergeObject(statisticsData, { [key]: data })));
      } else if (tab === "timelines") {
        const data = { ...stateData } as TimelinesData;
        categories.forEach((category) => {
          properties.forEach((property) => {
            const value = data[category][property].data;
            const sortedValue = value.slice().sort((a, b) => {
              const x = sort[tab] === "alphabetical" ? a.name.toLowerCase() : a.total;
              const y = sort[tab] === "alphabetical" ? b.name.toLowerCase() : b.total;
              const c = a.name.toLowerCase();
              const d = b.name.toLowerCase();
              if (x < y) {
                return sort[tab] === "alphabetical" ? -1 : 1;
              }
              if (x > y) {
                return sort[tab] === "alphabetical" ? 1 : -1;
              }
              if (c < d) {
                return -1;
              }
              if (c > d) {
                return 1;
              }
              return 0;
            });
            data[category][property].data = sortedValue;
          });
        });
        dispatch(setStatisticsData(mergeObject(statisticsData, { [key]: data })));
      } else {
        const data = { ...stateData } as StatusData | ShippedData | VendorData;
        properties.forEach((properties) => {
          type DataObj = StatusDataObject | ShippedDataObject | VendorDataObject;
          const value = data[properties];
          const sortedValue = value.slice().sort((a: DataObj, b: DataObj) => {
            if (hasKey(sort, tab)) {
              const x = sort[tab] === "total" ? a.total : a.name.toLowerCase();
              const y = sort[tab] === "total" ? b.total : b.name.toLowerCase();
              const c = a.name.toLowerCase();
              const d = b.name.toLowerCase();
              if (x < y) {
                return sort[tab] === "total" ? 1 : -1;
              }
              if (x > y) {
                return sort[tab] === "total" ? -1 : 1;
              }
              if (c < d) {
                return -1;
              }
              if (c > d) {
                return 1;
              }
              return 0;
            } else {
              return 0;
            }
          });
          data[properties] = sortedValue;
        });
        dispatch(setStatisticsData(mergeObject(statisticsData, { [key]: data })));
      }
    }
  }
};
