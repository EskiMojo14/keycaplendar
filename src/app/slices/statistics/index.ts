import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import produce from "immer";
import type { RootState } from "~/app/store";
import { categories, properties } from "@s/statistics/constants";
import { alphabeticalSortPropCurried } from "@s/util/functions";
import type {
  StatisticsData,
  StatisticsSortType,
  StatisticsType,
  StatsTab,
} from "./types";

type StatisticsState = {
  data: StatisticsData;
  loading: boolean;
  settings: StatisticsType;
  sort: StatisticsSortType;
  tab: StatsTab;
};

export const initialState: StatisticsState = {
  data: {
    duration: {
      gbLaunch: {
        breakdown: {
          designer: [],
          profile: [],
          vendor: [],
        },
        summary: {
          chartData: { labels: [], series: [] },
          mean: 0,
          median: 0,
          mode: [],
          name: "GB duration (days)",
          range: "",
          standardDev: 0,
          total: 0,
        },
      },
      icDate: {
        breakdown: {
          designer: [],
          profile: [],
          vendor: [],
        },
        summary: {
          chartData: { labels: [], series: [] },
          mean: 0,
          median: 0,
          mode: [],
          name: "IC duration (months)",
          range: "",
          standardDev: 0,
          total: 0,
        },
      },
    },
    shipped: {
      breakdown: {
        designer: [],
        profile: [],
        vendor: [],
      },
      months: [],
      summary: {
        name: "Shipped sets by GB month",
        shipped: 0,
        timeline: {
          shipped: [],
          unshipped: [],
        },
        total: 0,
        unshipped: 0,
      },
    },
    status: {
      breakdown: {
        designer: [],
        profile: [],
        vendor: [],
      },
      summary: {
        ic: 0,
        liveGb: 0,
        name: "Current keyset status",
        postGb: 0,
        preGb: 0,
        total: 0,
      },
    },
    timelines: {
      gbLaunch: {
        allProfiles: [],
        breakdown: {
          designer: [],
          profile: [],
          vendor: [],
        },
        months: [],
        summary: {
          breakdown: {
            name: "GBs per month by profile",
            timeline: {
              profiles: [],
              series: [],
            },
            total: 0,
          },
          count: {
            name: "GBs per month",
            timeline: {
              profiles: [],
              series: [],
            },
            total: 0,
          },
        },
      },
      icDate: {
        allProfiles: [],
        breakdown: {
          designer: [],
          profile: [],
          vendor: [],
        },
        months: [],
        summary: {
          breakdown: {
            name: "ICs per month by profile",
            timeline: {
              profiles: [],
              series: [],
            },
            total: 0,
          },
          count: {
            name: "ICs per month",
            timeline: {
              profiles: [],
              series: [],
            },
            total: 0,
          },
        },
      },
    },
    vendors: {
      breakdown: {
        designer: [],
        profile: [],
        vendor: [],
      },
      summary: {
        chartData: { labels: [], series: [] },
        mean: 0,
        median: 0,
        mode: [],
        name: "Vendors per set",
        range: "",
        standardDev: 0,
        total: 0,
      },
    },
  },
  loading: false,
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
  tab: "summary",
};

export const statisticsSlice = createSlice({
  initialState,
  name: "statistics",
  reducers: {
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setStatisticsData: (state, { payload }: PayloadAction<StatisticsData>) => {
      state.data = payload;
    },
    setStatisticsSetting: {
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
    setStatisticsSort: {
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
    setStatsTab: (state, { payload }: PayloadAction<StatsTab>) => {
      state.tab = payload;
    },
  },
});

export const {
  actions: { setLoading, setStatisticsData, setStatsTab },
} = statisticsSlice;

export const selectTab = (state: RootState) => state.statistics.tab;

export const selectUnsortedData = (state: RootState) => state.statistics.data;

export const selectLoading = (state: RootState) => state.statistics.loading;

export const selectSettings = (state: RootState) => state.statistics.settings;

export const selectSort = (state: RootState) => state.statistics.sort;

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
    setStatisticsSetting: _setStatisticsSetting,
    setStatisticsSort: _setStatisticsSort,
  },
} = statisticsSlice;

/** wrapper for generics */
export const setStatisticsSetting = _setStatisticsSetting as Pick<
  typeof _setStatisticsSetting,
  "match" | "type"
> &
  (<K extends keyof StatisticsType>(
    // eslint-disable-next-line no-use-before-define
    key: K,
    // eslint-disable-next-line no-use-before-define
    value: StatisticsType[K]
  ) => ReturnType<typeof _setStatisticsSetting>);

// carry over type and match properties
Object.assign(setStatisticsSetting, _setStatisticsSetting);

/** wrapper for generics */
export const setStatisticsSort = _setStatisticsSort as Pick<
  typeof _setStatisticsSort,
  "match" | "type"
> &
  (<K extends keyof StatisticsSortType>(
    // eslint-disable-next-line no-use-before-define
    key: K,
    // eslint-disable-next-line no-use-before-define
    value: StatisticsSortType[K]
  ) => ReturnType<typeof _setStatisticsSort>);

// carry over type and match properties
Object.assign(setStatisticsSort, _setStatisticsSort);
