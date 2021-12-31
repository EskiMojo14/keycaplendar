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
  tab: "summary",
  loading: false,
  data: {
    timelines: {
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
    status: {
      summary: {
        name: "Current keyset status",
        total: 0,
        ic: 0,
        preGb: 0,
        liveGb: 0,
        postGb: 0,
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
    duration: {
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
    vendors: {
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
    setStatsTab: (state, { payload }: PayloadAction<StatsTab>) => {
      state.tab = payload;
    },
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setStatisticsData: (state, { payload }: PayloadAction<StatisticsData>) => {
      state.data = payload;
    },
    setStatisticsSettingState: <T extends keyof StatisticsType>(
      state: StatisticsState,
      { payload }: PayloadAction<{ key: T; value: StatisticsType[T] }>
    ) => {
      const { key, value } = payload;
      state.settings[key] = value;
    },
    setStatisticsSortState: <T extends keyof StatisticsSortType>(
      state: StatisticsState,
      { payload }: PayloadAction<{ key: T; value: StatisticsSortType[T] }>
    ) => {
      const { key, value } = payload;
      state.sort[key] = value;
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
