import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import type { StatisticsChartSettingType, StatisticsData, StatisticsSortType, StatisticsType, StatsTab } from "./types";

type StatisticsState = {
  tab: StatsTab;
  loading: boolean;
  data: StatisticsData;
  settings: StatisticsType;
  sort: StatisticsSortType;
  chartSettings: StatisticsChartSettingType;
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
          monthsLine: [],
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
          monthsLine: [],
        },
        breakdown: {
          profile: [],
          designer: [],
          vendor: [],
        },
      },
    },
    calendar: {
      icDate: {
        start: "",
        end: "",
        years: 0,
        summary: {
          name: "ICs per day",
          total: 0,
          data: [],
        },
        breakdown: {
          profile: [],
          designer: [],
          vendor: [],
        },
      },
      gbLaunch: {
        start: "",
        end: "",
        years: 0,
        summary: {
          name: "Live GBs per day",
          total: 0,
          data: [],
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
        monthsLine: [],
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
          dataLine: [],
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
          dataLine: [],
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
        dataLine: [],
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
    calendarCat: "gbLaunch",
    calendarGroup: "profile",
    status: "profile",
    shipped: "profile",
    durationCat: "gbLaunch",
    durationGroup: "profile",
    vendors: "profile",
  },
  sort: {
    timelines: "total",
    calendar: "total",
    status: "total",
    shipped: "total",
    duration: "total",
    vendors: "total",
  },
  chartSettings: {
    barLine: {
      timelines: {
        stacked: true,
        type: "line",
      },
      shipped: {
        stacked: true,
        type: "bar",
      },
      duration: {
        stacked: true,
        type: "line",
      },
      vendors: {
        stacked: true,
        type: "line",
      },
    },
    sunburstPacking: {
      status: {
        type: "sunburst",
      },
    },
    calendar: {
      calendar: {
        palette: "gradient",
      },
    },
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
    setStatisticsBarLineChartSetting: <
      Tab extends keyof StatisticsChartSettingType["barLine"],
      Setting extends keyof StatisticsChartSettingType["barLine"][Tab]
    >(
      state: StatisticsState,
      {
        payload: { tab, key, value },
      }: PayloadAction<{
        tab: Tab;
        key: Setting;
        value: StatisticsChartSettingType["barLine"][Tab][Setting];
      }>
    ) => {
      state.chartSettings.barLine[tab][key] = value;
    },
    setStatisticsSunburstPackingChartSetting: <
      Tab extends keyof StatisticsChartSettingType["sunburstPacking"],
      Setting extends keyof StatisticsChartSettingType["sunburstPacking"][Tab]
    >(
      state: StatisticsState,
      {
        payload: { tab, key, value },
      }: PayloadAction<{
        tab: Tab;
        key: Setting;
        value: StatisticsChartSettingType["sunburstPacking"][Tab][Setting];
      }>
    ) => {
      state.chartSettings.sunburstPacking[tab][key] = value;
    },
    setStatisticsCalendarChartSetting: <
      Tab extends keyof StatisticsChartSettingType["calendar"],
      Setting extends keyof StatisticsChartSettingType["calendar"][Tab]
    >(
      state: StatisticsState,
      {
        payload: { tab, key, value },
      }: PayloadAction<{
        tab: Tab;
        key: Setting;
        value: StatisticsChartSettingType["calendar"][Tab][Setting];
      }>
    ) => {
      state.chartSettings.calendar[tab][key] = value;
    },
  },
});

export const {
  actions: {
    setStatsTab,
    setLoading,
    setStatisticsData,
    setStatisticsSettingState,
    setStatisticsSortState,
    setStatisticsBarLineChartSetting,
    setStatisticsSunburstPackingChartSetting,
    setStatisticsCalendarChartSetting,
  },
} = statisticsSlice;

export const setStatisticsSetting = <T extends keyof StatisticsType>(key: T, value: StatisticsType[T]) =>
  setStatisticsSettingState({ key, value });

export const setStatisticsSort = <T extends keyof StatisticsSortType>(key: T, value: StatisticsSortType[T]) =>
  setStatisticsSortState({ key, value });

export const selectTab = (state: RootState) => state.statistics.tab;

export const selectData = (state: RootState) => state.statistics.data;

export const selectLoading = (state: RootState) => state.statistics.loading;

export const selectSettings = (state: RootState) => state.statistics.settings;

export const selectSort = (state: RootState) => state.statistics.sort;

export const selectChartSettings = (state: RootState) => state.statistics.chartSettings;

export default statisticsSlice.reducer;
