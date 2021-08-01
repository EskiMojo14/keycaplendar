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
    summaryData: {
      count: {
        icDate: { total: 0, months: [], series: [] },
        gbLaunch: { total: 0, months: [], series: [] },
      },
      profile: {
        icDate: {
          profiles: [],
          data: {
            name: "Profile breakdown",
            total: 0,
            timeline: {
              months: [],
              profiles: [],
              series: [],
            },
          },
        },
        gbLaunch: {
          profiles: [],
          data: {
            name: "Profile breakdown",
            total: 0,
            timeline: {
              months: [],
              profiles: [],
              series: [],
            },
          },
        },
      },
    },
    timelinesData: {
      icDate: {
        profile: {
          profiles: [],
          data: [],
        },
        designer: {
          profiles: [],
          data: [],
        },
        vendor: {
          profiles: [],
          data: [],
        },
      },
      gbLaunch: {
        profile: {
          profiles: [],
          data: [],
        },
        designer: {
          profiles: [],
          data: [],
        },
        vendor: {
          profiles: [],
          data: [],
        },
      },
    },
    statusData: {
      profile: [],
      designer: [],
      vendor: [],
    },
    shippedData: {
      profile: [],
      designer: [],
      vendor: [],
    },
    durationData: {
      icDate: {
        profile: [],
        designer: [],
        vendor: [],
      },
      gbLaunch: {
        profile: [],
        designer: [],
        vendor: [],
      },
    },
    vendorsData: {
      profile: [],
      designer: [],
      vendor: [],
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
