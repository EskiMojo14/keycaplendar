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

export const initialState: StatisticsState = {
  tab: "summary",
  loading: false,
  data: {
    timelines: {
      icDate: {
        months: [],
        allProfiles: [],
        summary: {
          name: "ICs per month",
          total: 0,
          profiles: [],
          months: [],
        },
        breakdown: {
          profile: [],
          designer: [],
          vendor: [],
        },
      },
      gbLaunch: {
        months: [],
        allProfiles: [],
        summary: {
          name: "GBs per month",
          total: 0,
          profiles: [],
          months: [],
        },
        breakdown: {
          profile: [],
          designer: [],
          vendor: [],
        },
      },
    },
    status: {
      summary: {
        name: "Current keyset status",
        total: 0,
        pie: { ic: 0, preGb: 0, liveGb: 0, postGb: 0, postGbShipped: 0 },
        sunburst: {
          id: "Status",
          children: [],
        },
      },
      breakdown: {
        profile: [],
        designer: [],
        vendor: [],
      },
    },
    shipped: {
      summary: {
        name: "Shipped sets by GB month",
        total: 0,
        shipped: 0,
        unshipped: 0,
        months: [],
      },
      months: [],
      breakdown: {
        profile: [],
        designer: [],
        vendor: [],
      },
    },
    duration: {
      icDate: {
        summary: {
          name: "IC duration (months)",
          total: 0,
          mean: 0,
          median: 0,
          mode: [],
          range: "",
          standardDev: 0,
          data: [],
        },
        breakdown: {
          profile: [],
          designer: [],
          vendor: [],
        },
      },
      gbLaunch: {
        summary: {
          name: "GB duration (days)",
          total: 0,
          mean: 0,
          median: 0,
          mode: [],
          range: "",
          standardDev: 0,
          data: [],
        },
        breakdown: {
          profile: [],
          designer: [],
          vendor: [],
        },
      },
    },
    vendors: {
      summary: {
        name: "Vendors per set",
        total: 0,
        mean: 0,
        median: 0,
        mode: [],
        range: "",
        standardDev: 0,
        data: [],
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
