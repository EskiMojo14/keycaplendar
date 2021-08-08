import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { StatsTab, StatisticsData, StatisticsType, StatisticsSortType } from "./types";

type StatisticsState = {
  tab: StatsTab;
  loading: boolean;
  data: StatisticsData;
  settings: StatisticsType;
  sort: StatisticsSortType;
};

const initialState: StatisticsState = {
  tab: "summary",
  loading: false,
  data: {
    timelinesData: {
      icDate: {
        summary: {
          count: {
            name: "ICs per month",
            total: 0,
            timeline: {
              profiles: [],
              series: [],
            },
          },
          breakdown: {
            name: "ICs per month by profile",
            total: 0,
            timeline: {
              profiles: [],
              series: [],
            },
          },
        },
        months: [],
        allProfiles: [],
        breakdown: {
          profile: [],
          designer: [],
          vendor: [],
        },
      },
      gbLaunch: {
        summary: {
          count: {
            name: "GBs per month",
            total: 0,
            timeline: {
              profiles: [],
              series: [],
            },
          },
          breakdown: {
            name: "GBs per month by profile",
            total: 0,
            timeline: {
              profiles: [],
              series: [],
            },
          },
        },
        months: [],
        allProfiles: [],
        breakdown: {
          profile: [],
          designer: [],
          vendor: [],
        },
      },
    },
    statusData: {
      profile: [],
      designer: [],
      vendor: [],
    },
    shippedData: {
      summary: {
        name: "Shipped sets by GB month",
        total: 0,
        shipped: 0,
        unshipped: 0,
        timeline: {
          shipped: [],
          unshipped: [],
        },
      },
      months: [],
      breakdown: {
        profile: [],
        designer: [],
        vendor: [],
      },
    },
    durationData: {
      icDate: {
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
        breakdown: {
          profile: [],
          designer: [],
          vendor: [],
        },
      },
      gbLaunch: {
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
        breakdown: {
          profile: [],
          designer: [],
          vendor: [],
        },
      },
    },
    vendorsData: {
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
      breakdown: {
        profile: [],
        designer: [],
        vendor: [],
      },
    },
  },
  settings: {
    summary: "gbLaunch",
    timelinesCat: "gbLaunch",
    timelinesGroup: "profile",
    status: "profile",
    shipped: "profile",
    durationCat: "gbLaunch",
    durationGroup: "profile",
    vendors: "profile",
  },
  sort: {
    timelines: "total",
    status: "total",
    shipped: "total",
    duration: "total",
    vendors: "total",
  },
};

export const statisticsSlice = createSlice({
  name: "statistics",
  initialState,
  reducers: {
    setStatsTab: (state, action: PayloadAction<StatsTab>) => {
      state.tab = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setStatisticsData: (state, action: PayloadAction<StatisticsData>) => {
      state.data = action.payload;
    },
    setStatisticsSetting: <T extends keyof StatisticsType>(
      state: StatisticsState,
      action: PayloadAction<{ key: T; value: StatisticsType[T] }>
    ) => {
      const { key, value } = action.payload;
      state.settings[key] = value;
    },
    setStatisticsSort: <T extends keyof StatisticsSortType>(
      state: StatisticsState,
      action: PayloadAction<{ key: T; value: StatisticsSortType[T] }>
    ) => {
      const { key, value } = action.payload;
      state.sort[key] = value;
    },
  },
});

export const {
  setStatsTab,
  setLoading,
  setStatisticsData,
  setStatisticsSetting,
  setStatisticsSort,
} = statisticsSlice.actions;

export const selectTab = (state: RootState) => state.statistics.tab;

export const selectData = (state: RootState) => state.statistics.data;

export const selectLoading = (state: RootState) => state.statistics.loading;

export const selectSettings = (state: RootState) => state.statistics.settings;

export const selectSort = (state: RootState) => state.statistics.sort;

export default statisticsSlice.reducer;
