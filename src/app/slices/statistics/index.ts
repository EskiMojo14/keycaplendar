import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import type {
  StatisticsChartSettingType,
  StatisticsData,
  StatisticsSortType,
  StatisticsType,
  StatsTab,
} from "./types";

type StatisticsState = {
  chartSettings: StatisticsChartSettingType;
  data: StatisticsData;
  loading: boolean;
  settings: StatisticsType;
  sort: StatisticsSortType;
  tab: StatsTab;
};

export const initialState: StatisticsState = {
  chartSettings: {
    barLine: {
      duration: {
        stacked: true,
        type: "line",
      },
      shipped: {
        stacked: true,
        type: "bar",
      },
      timelines: {
        stacked: true,
        type: "line",
      },
      vendors: {
        stacked: true,
        type: "line",
      },
    },
    calendar: {
      calendar: {
        palette: "gradient",
      },
    },
    sunburstPacking: {
      status: {
        type: "sunburst",
      },
    },
  },
  data: {
    calendar: {
      gbLaunch: {
        breakdown: {
          designer: [],
          profile: [],
          vendor: [],
        },
        end: "",
        start: "",
        summary: {
          data: [],
          name: "Live GBs per day",
          total: 0,
        },
        years: 0,
      },
      icDate: {
        breakdown: {
          designer: [],
          profile: [],
          vendor: [],
        },
        end: "",
        start: "",
        summary: {
          data: [],
          name: "ICs per day",
          total: 0,
        },
        years: 0,
      },
    },
    duration: {
      gbLaunch: {
        breakdown: {
          designer: [],
          profile: [],
          vendor: [],
        },
        summary: {
          data: [],
          dataLine: [],
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
          data: [],
          dataLine: [],
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
        months: [],
        monthsLine: [],
        name: "",
        shipped: 0,
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
        name: "Current keyset status",
        pie: { ic: 0, liveGb: 0, postGb: 0, postGbShipped: 0, preGb: 0 },
        sunburst: {
          children: [],
          id: "Status",
        },
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
          months: [],
          monthsLine: [],
          name: "GBs per month",
          profiles: [],
          total: 0,
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
          months: [],
          monthsLine: [],
          name: "ICs per month",
          profiles: [],
          total: 0,
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
        data: [],
        dataLine: [],
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
    calendarCat: "gbLaunch",
    calendarGroup: "profile",
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
    calendar: "total",
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
    setStatisticsBarLineChartSetting: <
      Tab extends keyof StatisticsChartSettingType["barLine"],
      Setting extends keyof StatisticsChartSettingType["barLine"][Tab]
    >(
      state: StatisticsState,
      {
        payload: { key, tab, value },
      }: PayloadAction<{
        key: Setting;
        tab: Tab;
        value: StatisticsChartSettingType["barLine"][Tab][Setting];
      }>
    ) => {
      state.chartSettings.barLine[tab][key] = value;
    },
    setStatisticsCalendarChartSetting: <
      Tab extends keyof StatisticsChartSettingType["calendar"],
      Setting extends keyof StatisticsChartSettingType["calendar"][Tab]
    >(
      state: StatisticsState,
      {
        payload: { key, tab, value },
      }: PayloadAction<{
        key: Setting;
        tab: Tab;
        value: StatisticsChartSettingType["calendar"][Tab][Setting];
      }>
    ) => {
      state.chartSettings.calendar[tab][key] = value;
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
    setStatisticsSunburstPackingChartSetting: <
      Tab extends keyof StatisticsChartSettingType["sunburstPacking"],
      Setting extends keyof StatisticsChartSettingType["sunburstPacking"][Tab]
    >(
      state: StatisticsState,
      {
        payload: { key, tab, value },
      }: PayloadAction<{
        key: Setting;
        tab: Tab;
        value: StatisticsChartSettingType["sunburstPacking"][Tab][Setting];
      }>
    ) => {
      state.chartSettings.sunburstPacking[tab][key] = value;
    },
    setStatsTab: (
      state: StatisticsState,
      { payload }: PayloadAction<StatsTab>
    ) => {
      state.tab = payload;
    },
  },
});

export const {
  actions: {
    setLoading,
    setStatisticsBarLineChartSetting,
    setStatisticsCalendarChartSetting,
    setStatisticsData,
    setStatisticsSunburstPackingChartSetting,
    setStatsTab,
  },
} = statisticsSlice;

export const selectTab = (state: RootState) => state.statistics.tab;

export const selectData = (state: RootState) => state.statistics.data;

export const selectLoading = (state: RootState) => state.statistics.loading;

export const selectSettings = (state: RootState) => state.statistics.settings;

export const selectSort = (state: RootState) => state.statistics.sort;

export const selectChartSettings = (state: RootState) =>
  state.statistics.chartSettings;

export default statisticsSlice.reducer;

const {
  actions: {
    setStatisticsSetting: _setStatisticsSetting,
    setStatisticsSort: _setStatisticsSort,
  },
} = statisticsSlice;

/** wrapper for generics */
export const setStatisticsSetting = (<T extends keyof StatisticsType>(
  key: T,
  value: StatisticsType[T]
) => _setStatisticsSetting(key, value)) as Pick<
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
export const setStatisticsSort = (<T extends keyof StatisticsSortType>(
  key: T,
  value: StatisticsSortType[T]
) => _setStatisticsSort(key, value)) as Pick<
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
