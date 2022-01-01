import type { Serie as LineSeries } from "@nivo/line";
import type { Overwrite } from "@s/util/types";
import type { categories, properties, statsTabs } from "./constants";

export type Categories = typeof categories[number];

export type Properties = typeof properties[number];

export type Sorts = "alphabetical" | "total";

export type StatsTab = typeof statsTabs[number];

export type StatisticsType = {
  calendarCat: Categories;
  calendarGroup: Properties;
  durationCat: Categories;
  durationGroup: Properties;
  shipped: Properties;
  status: Properties;
  summary: Categories;
  timelinesCat: Categories;
  timelinesGroup: Properties;
  vendors: Properties;
};

export type StatisticsSortType = {
  calendar: Sorts;
  duration: Sorts | "duration";
  shipped: Sorts;
  status: Sorts;
  timelines: Sorts;
  vendors: Sorts;
};

export type BarLineTabs = "duration" | "shipped" | "timelines" | "vendors";

export type SunburstPackingTabs = "status";

export type CalendarTabs = "calendar";

export type StatisticsChartSettingType = {
  barLine: {
    [tab in BarLineTabs]: { stacked: boolean; type: "bar" | "line" };
  };
  calendar: {
    [tab in CalendarTabs]: { palette: "gradient" | "heatmap" };
  };
  sunburstPacking: {
    [tab in SunburstPackingTabs]: { type: "packing" | "sunburst" };
  };
};

export type TimelinesDataObject<Optimised extends boolean = false> =
  Optimised extends true
    ? {
        months: Record<string, number>[];
        name: string;
        profiles: string[];
        total: number;
      }
    : {
        months: Record<string, number | string>[];
        monthsLine: LineSeries[];
        name: string;
        profiles: string[];
        total: number;
      };

export type TimelinesData<Optimised extends boolean = false> = Record<
  Categories,
  {
    allProfiles: string[];
    breakdown: Optimised extends true
      ? Overwrite<
          Record<Properties, TimelinesDataObject<Optimised>[]>,
          { profile: { name: string; total: number }[] }
        >
      : Record<Properties, TimelinesDataObject<Optimised>[]>;
    months: string[];
    summary: TimelinesDataObject<Optimised>;
  }
>;

export type CalendarDatum<Optimised extends boolean = false> =
  Optimised extends true
    ? {
        index: number;
        val: number;
      }
    : {
        day: string;
        value: number;
      };

export type CalendarDataObject<Optimised extends boolean = false> = {
  data: CalendarDatum<Optimised>[];
  name: string;
  total: number;
};

export type CalendarData<Optimised extends boolean = false> = Record<
  Categories,
  Optimised extends true
    ? {
        breakdown: Record<Properties, CalendarDataObject<Optimised>[]>;
        end: string;
        start: string;
        summary: CalendarDataObject<Optimised>;
      }
    : {
        breakdown: Record<Properties, CalendarDataObject<Optimised>[]>;
        end: string;
        start: string;
        summary: CalendarDataObject<Optimised>;
        years: number;
      }
>;

export type StatusDataObjectSunburstDatum<Optimised extends boolean = false> =
  Optimised extends true
    ? {
        id: string;
        val: number;
        index?: number;
      }
    : {
        id: string;
        val: number;
      };

export type StatusDataObjectSunburstChild<Optimised extends boolean = false> =
  // eslint-disable-next-line no-use-before-define
  | StatusDataObjectSunburstChildWithChild<Optimised>
  | StatusDataObjectSunburstDatum<Optimised>;

export type StatusDataObjectSunburstChildWithChild<
  Optimised extends boolean = false
> = Optimised extends true
  ? {
      children: (
        | StatusDataObjectSunburstChild<Optimised>
        | StatusDataObjectSunburstDatum<Optimised>
      )[];
      id?: string;
      index?: number;
    }
  : {
      children: (
        | StatusDataObjectSunburstChild<Optimised>
        | StatusDataObjectSunburstDatum<Optimised>
      )[];
      id: string;
    };

export type StatusDataObject<Optimised extends boolean = false> =
  Optimised extends true
    ? {
        name: string;
        total: number;
        pie?: {
          ic?: number;
          liveGb?: number;
          postGb?: number;
          postGbShipped?: number;
          preGb?: number;
        };
        sunburst?: StatusDataObjectSunburstChild<true>[];
      }
    : {
        name: string;
        pie: {
          ic: number;
          liveGb: number;
          postGb: number;
          postGbShipped: number;
          preGb: number;
        };
        sunburst: StatusDataObjectSunburstChildWithChild;
        total: number;
      };

export type StatusData<Optimised extends boolean = false> = {
  breakdown: Record<Properties, StatusDataObject<Optimised>[]>;
  summary: StatusDataObject<Optimised>;
};

export type ShippedDataObject<Optimised extends boolean = false> =
  Optimised extends true
    ? {
        months: {
          index?: number;
          month?: string;
          shipped?: number;
          unshipped?: number;
        }[];
        name: string;
        total: number;
        shipped?: number;
        unshipped?: number;
      }
    : {
        months: { month: string; shipped: number; unshipped: number }[];
        monthsLine: LineSeries[];
        name: string;
        shipped: number;
        total: number;
        unshipped: number;
      };

export type ShippedData<Optimised extends boolean = false> = {
  breakdown: Record<Properties, ShippedDataObject<Optimised>[]>;
  months: string[];
  summary: ShippedDataObject<Optimised>;
};

export type CountDataObject<Optimised extends boolean = false> =
  Optimised extends true
    ? {
        data: { count: number; id: number; index?: number }[];
        name: string;
        total: number;
        mean?: number;
        median?: number;
        mode?: number[];
        range?: string;
        standardDev?: number;
      }
    : {
        data: { count: number; id: number }[];
        dataLine: LineSeries[];
        mean: number;
        median: number;
        mode: number[];
        name: string;
        range: string;
        standardDev: number;
        total: number;
      };

export type DurationData<Optimised extends boolean = false> = Record<
  Categories,
  {
    breakdown: Record<Properties, CountDataObject<Optimised>[]>;
    summary: CountDataObject<Optimised>;
  }
>;

export type VendorData<Optimised extends boolean = false> = {
  breakdown: Record<Properties, CountDataObject<Optimised>[]>;
  summary: CountDataObject<Optimised>;
};

export type StatisticsData<Optimised extends boolean = false> = {
  calendar: CalendarData<Optimised>;
  duration: DurationData<Optimised>;
  shipped: ShippedData<Optimised>;
  status: StatusData<Optimised>;
  timelines: TimelinesData<Optimised>;
  vendors: VendorData<Optimised>;
};

export type OptimisedStatisticsData = StatisticsData<true>;
