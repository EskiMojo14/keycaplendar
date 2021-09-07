import { Overwrite } from "../util/types";
import { VendorType } from "../main/types";

export type StatisticsSetType = {
  colorway: string;
  designer: string[];
  gbEnd: string;
  gbLaunch: string;
  icDate: string;
  profile: string;
  shipped?: boolean;
  vendors?: VendorType[];
};

export type Categories = "icDate" | "gbLaunch";

export type Properties = "profile" | "designer" | "vendor";

export type TimelinesDataObject<Optimised extends true | false = false> = {
  name: string;
  total: number;
  profiles: string[];
  months: Record<string, Optimised extends true ? number : string | number>[];
};

export type TimelinesData<Optimised extends true | false = false> = Record<
  Categories,
  {
    months: string[];
    allProfiles: string[];
    summary: TimelinesDataObject<Optimised>;
    breakdown: Overwrite<
      Record<Properties, TimelinesDataObject<Optimised>[]>,
      { profile: { name: string; total: number }[] }
    >;
  }
>;

export type CalendarDatum<Optimised extends true | false = false> = Optimised extends true
  ? {
      index: number;
      val: number;
    }
  : {
      day: string;
      value: number;
    };

export type CalendarDataObject<Optimised extends true | false = false> = {
  name: string;
  total: number;
  data: CalendarDatum<Optimised>[];
};

export type CalendarData<Optimised extends true | false = false> = Record<
  Categories,
  {
    summary: CalendarDataObject<Optimised>;
    breakdown: Record<Properties, CalendarDataObject<Optimised>[]>;
    start: string;
    end: string;
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
      sunburst: StatusDataObjectSunburstChild;
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
      months: { month?: string; shipped: number; unshipped: number }[];
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
  calendar: CalendarData<Optimised>;
  status: StatusData<Optimised>;
  shipped: ShippedData<Optimised>;
  duration: DurationData<Optimised>;
  vendors: VendorData<Optimised>;
};

export type OptimisedStatisticsData = StatisticsData<true>;
