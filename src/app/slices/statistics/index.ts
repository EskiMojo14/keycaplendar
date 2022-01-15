import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
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
    setStatisticsSettingState: <T extends keyof StatisticsType>(
      state: StatisticsState,
      {
        payload: { key, value },
      }: PayloadAction<{ key: T; value: StatisticsType[T] }>
    ) => {
      state.settings[key] = value;
    },
    setStatisticsSortState: <T extends keyof StatisticsSortType>(
      state: StatisticsState,
      {
        payload: { key, value },
      }: PayloadAction<{ key: T; value: StatisticsSortType[T] }>
    ) => {
      state.sort[key] = value;
    },
    setStatsTab: (state, { payload }: PayloadAction<StatsTab>) => {
      state.tab = payload;
    },
  },
});

export const {
  actions: {
    setLoading,
    setStatisticsData,
    setStatisticsSettingState,
    setStatisticsSortState,
    setStatsTab,
  },
} = statisticsSlice;

export const setStatisticsSetting = <T extends keyof StatisticsType>(
  key: T,
  value: StatisticsType[T]
) => setStatisticsSettingState({ key, value });

export const setStatisticsSort = <T extends keyof StatisticsSortType>(
  key: T,
  value: StatisticsSortType[T]
) => setStatisticsSortState({ key, value });

export const selectTab = (state: RootState) => state.statistics.tab;

export const selectData = (state: RootState) => state.statistics.data;

export const selectLoading = (state: RootState) => state.statistics.loading;

export const selectSettings = (state: RootState) => state.statistics.settings;

export const selectSort = (state: RootState) => state.statistics.sort;

export default statisticsSlice.reducer;
