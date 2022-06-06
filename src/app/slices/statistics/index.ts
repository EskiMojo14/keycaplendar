import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import produce from "immer";
import { DateTime } from "luxon";
import { matchPath } from "react-router-dom";
import { notify } from "~/app/snackbar-queue";
import type { RootState } from "~/app/store";
import baseApi from "@s/api";
import { addErrorMessages } from "@s/api/functions";
import firebase from "@s/firebase";
import { selectLocation } from "@s/router";
import {
  blankStatisticsData,
  categories,
  properties,
} from "@s/statistics/constants";
import { alphabeticalSortPropCurried, ordinal } from "@s/util/functions";
import type {
  StatisticsData,
  StatisticsSortType,
  StatisticsType,
  StatsTab,
} from "./types";

const storage = firebase.storage();

export const statisticsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStatisticsData: build.query<StatisticsData, void>({
      onQueryStarted: async (_, { queryFulfilled }) => {
        const {
          data: { timestamp },
        } = await queryFulfilled;
        if (timestamp) {
          const luxonTimetamp = DateTime.fromISO(timestamp, { zone: "utc" });
          const timestampOrdinal = ordinal(luxonTimetamp.day);
          const formattedTimestamp = luxonTimetamp.toFormat(
            `HH:mm d'${timestampOrdinal}' MMM yyyy 'UTC'`
          );
          notify({
            timeout: 4000,
            title: `Last updated: ${formattedTimestamp}`,
          });
        }
      },
      queryFn: async () => {
        const fileRef = storage.ref("statisticsData.json");
        try {
          const url = await fileRef.getDownloadURL();
          const data = await (await fetch(url)).json();
          return { data };
        } catch (error) {
          return { error };
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const { useGetStatisticsDataQuery } = statisticsApi;

addErrorMessages<typeof statisticsApi.endpoints>({
  getStatisticsData: "Failed to get statistics data",
});

type StatisticsState = {
  data: StatisticsData;
  settings: StatisticsType;
  sort: StatisticsSortType;
};

export const initialState: StatisticsState = {
  data: blankStatisticsData,
  settings: {
    durationCat: "gbLaunch",
    durationGroup: "profile",
    shipped: "profile",
    status: "profile",
    summary: "gbLaunch",
    timelinesCat: "gbLaunch",
    timelinesGroup: "profile",
    vendors: "profile",
  },
  sort: {
    duration: "total",
    shipped: "total",
    status: "total",
    timelines: "total",
    vendors: "total",
  },
};

export const statisticsSlice = createSlice({
  extraReducers: (builder) =>
    builder.addMatcher(
      statisticsApi.endpoints.getStatisticsData.matchFulfilled,
      (state, { payload }: PayloadAction<StatisticsData>) => {
        state.data = payload;
      }
    ),
  initialState,
  name: "statistics",
  reducers: {
    statisticsSetting: {
      prepare: <T extends keyof StatisticsType>(
        key: T,
        value: StatisticsType[T]
      ) => ({ payload: { key, value } }),
      reducer: <T extends keyof StatisticsType>(
        state: StatisticsState,
        { payload }: PayloadAction<{ key: T; value: StatisticsType[T] }>
      ) => {
        const { key, value } = payload;
        state.settings[key] = value;
      },
    },
    statisticsSort: {
      prepare: <T extends keyof StatisticsSortType>(
        key: T,
        value: StatisticsSortType[T]
      ) => ({ payload: { key, value } }),
      reducer: <T extends keyof StatisticsSortType>(
        state: StatisticsState,
        { payload }: PayloadAction<{ key: T; value: StatisticsSortType[T] }>
      ) => {
        const { key, value } = payload;
        state.sort[key] = value;
      },
    },
  },
});

export const selectUnsortedData = (state: RootState) => state.statistics.data;

export const selectSettings = (state: RootState) => state.statistics.settings;

export const selectSort = (state: RootState) => state.statistics.sort;

export const selectTab = createSelector(selectLocation, (location) => {
  const match = matchPath<{ tab: StatsTab }>(
    location.pathname,
    "/statistics/:tab"
  );
  return match?.params.tab ?? "summary";
});

export const selectData = createSelector(
  selectTab,
  selectUnsortedData,
  selectSort,
  (tab, statisticsData, sort) =>
    produce(statisticsData, (statisticsDataDraft) => {
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
      } else if (tab !== "summary") {
        properties.forEach((properties) => {
          statisticsDataDraft[tab].breakdown[properties].sort((a, b) => {
            const key = sort[tab] === "total" ? "total" : "name";
            return (
              alphabeticalSortPropCurried(key, sort[tab] === "total")(a, b) ||
              alphabeticalSortPropCurried(key)(a, b)
            );
          });
        });
      }
    })
);

export default statisticsSlice.reducer;

const {
  actions: {
    statisticsSetting: _statisticsSetting,
    statisticsSort: _statisticsSort,
  },
} = statisticsSlice;

/** wrapper for generics */
export const statisticsSetting = _statisticsSetting as Pick<
  typeof _statisticsSetting,
  "match" | "type"
> &
  (<K extends keyof StatisticsType>(
    // eslint-disable-next-line no-use-before-define
    key: K,
    // eslint-disable-next-line no-use-before-define
    value: StatisticsType[K]
  ) => ReturnType<typeof _statisticsSetting>);

// carry over type and match properties
Object.assign(statisticsSetting, _statisticsSetting);

/** wrapper for generics */
export const statisticsSort = _statisticsSort as Pick<
  typeof _statisticsSort,
  "match" | "type"
> &
  (<K extends keyof StatisticsSortType>(
    // eslint-disable-next-line no-use-before-define
    key: K,
    // eslint-disable-next-line no-use-before-define
    value: StatisticsSortType[K]
  ) => ReturnType<typeof _statisticsSort>);

// carry over type and match properties
Object.assign(statisticsSort, _statisticsSort);
