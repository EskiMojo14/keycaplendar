import { Serie as LineSeries } from "@nivo/line";
import { Overwrite } from "@s/common/types";
import { statsTabs } from "./constants";

export type Categories = "icDate" | "gbLaunch";

export type Properties = "profile" | "designer" | "vendor";

export type Sorts = "total" | "alphabetical";

export type StatsTab = typeof statsTabs[number];

export type StatisticsType = {
  summary: Categories;
  timelinesCat: Categories;
  timelinesGroup: Properties;
  status: Properties;
  shipped: Properties;
  durationCat: Categories;
  durationGroup: Properties;
  vendors: Properties;
};

export type StatisticsSortType = {
  timelines: Sorts;
  status: Sorts;
  shipped: Sorts;
  duration: Sorts | "duration";
  vendors: Sorts;
};

export type TimelinesDataObject<Optimised extends true | false = false> = Optimised extends true
  ? {
      name: string;
      total: number;
      profiles: string[];
      months: Record<string, number>[];
    }
  : {
      name: string;
      total: number;
      profiles: string[];
      months: Record<string, string | number>[];
      monthsLine: LineSeries[];
    };

export type TimelinesData<Optimised extends true | false = false> = Record<
  Categories,
  {
    months: string[];
    allProfiles: string[];
    summary: TimelinesDataObject<Optimised>;
    breakdown: Optimised extends true
      ? Overwrite<Record<Properties, TimelinesDataObject<Optimised>[]>, { profile: { name: string; total: number }[] }>
      : Record<Properties, TimelinesDataObject<Optimised>[]>;
  }
>;

export type StatusDataObjectSunburstDatum<Optimised extends true | false = false> = Optimised extends true
  ? {
      id: string;
      index?: number;
      val: number;
    }
  : {
      id: string;
      val: number;
    };

export type StatusDataObjectSunburstChildWithChild<Optimised extends true | false = false> = Optimised extends true
  ? {
      id?: string;
      index?: number;
      children: (StatusDataObjectSunburstDatum<Optimised> | StatusDataObjectSunburstChild<Optimised>)[];
    }
  : {
      id: string;
      children: (StatusDataObjectSunburstDatum<Optimised> | StatusDataObjectSunburstChild<Optimised>)[];
    };

export type StatusDataObjectSunburstChild<Optimised extends true | false = false> =
  | StatusDataObjectSunburstChildWithChild<Optimised>
  | StatusDataObjectSunburstDatum<Optimised>;

export type StatusDataObject<Optimised extends true | false = false> = Optimised extends true
  ? {
      name: string;
      total: number;
      pie?: {
        ic?: number;
        preGb?: number;
        liveGb?: number;
        postGb?: number;
        postGbShipped?: number;
      };
      sunburst?: StatusDataObjectSunburstChild<true>[];
    }
  : {
      name: string;
      total: number;
      pie: {
        ic: number;
        preGb: number;
        liveGb: number;
        postGb: number;
        postGbShipped: number;
      };
      sunburst: StatusDataObjectSunburstChildWithChild;
    };

export type StatusData<Optimised extends true | false = false> = {
  summary: StatusDataObject<Optimised>;
  breakdown: Record<Properties, StatusDataObject<Optimised>[]>;
};

export type ShippedDataObject<Optimised extends true | false = false> = Optimised extends true
  ? {
      name: string;
      total: number;
      shipped?: number;
      unshipped?: number;
      months: { month?: string; index?: number; shipped?: number; unshipped?: number }[];
    }
  : {
      name: string;
      total: number;
      shipped: number;
      unshipped: number;
      months: { month: string; shipped: number; unshipped: number }[];
      monthsLine: LineSeries[];
    };

export type ShippedData<Optimised extends true | false = false> = {
  summary: ShippedDataObject<Optimised>;
  months: string[];
  breakdown: Record<Properties, ShippedDataObject<Optimised>[]>;
};

export type CountDataObject<Optimised extends true | false = false> = Optimised extends true
  ? {
      name: string;
      total: number;
      mean?: number;
      median?: number;
      mode?: number[];
      range?: string;
      standardDev?: number;
      data: { id: number; count: number; index?: number }[];
    }
  : {
      name: string;
      total: number;
      mean: number;
      median: number;
      mode: number[];
      range: string;
      standardDev: number;
      data: { id: number; count: number }[];
      dataLine: LineSeries[];
    };

export type DurationData<Optimised extends true | false = false> = Record<
  Categories,
  {
    summary: CountDataObject<Optimised>;
    breakdown: Record<Properties, CountDataObject<Optimised>[]>;
  }
>;

export type VendorData<Optimised extends true | false = false> = {
  summary: CountDataObject<Optimised>;
  breakdown: Record<Properties, CountDataObject<Optimised>[]>;
};

export type StatisticsData<Optimised extends true | false = false> = {
  timelines: TimelinesData<Optimised>;
  status: StatusData<Optimised>;
  shipped: ShippedData<Optimised>;
  duration: DurationData<Optimised>;
  vendors: VendorData<Optimised>;
};

export type OptimisedStatisticsData = StatisticsData<true>;
