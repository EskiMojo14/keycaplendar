import { Overwrite } from "@s/common/types";

export type Categories = "icDate" | "gbLaunch";

export type Properties = "profile" | "designer" | "vendor";

export const barDataToLineData = <Datum extends Record<string, any>>(
  datumArray: Datum[],
  id: string,
  xKey: keyof Datum | ((datum: Datum) => string | number) = "id",
  yKeys: (keyof Datum | ((datum: Datum) => string | number))[] = ["value" as keyof Datum]
): {
  id: string | number;
  data: {
    x: number | string | Date;
    y: number | string | Date;
  }[];
} => ({
  id,
  data: yKeys
    .map((yKey) =>
      datumArray.map((datum) => {
        const x = typeof xKey === "function" ? xKey(datum) : datum[xKey];
        const y = typeof yKey === "function" ? yKey(datum) : datum[yKey];
        return {
          x,
          y,
        };
      })
    )
    .flat(1),
});

export type TimelinesDataObject<Optimised extends true | false = false> = {
  name: string;
  total: number;
  profiles: string[];
  months: Record<string, Optimised extends true ? number : string | number>[];
};

const exampleTimelineDataObject: TimelinesDataObject = {
  name: "Summary",
  total: 493,
  profiles: ["ePBT ABS", "GMK"],
  months: [{ month: "Nov 20", GMK: 200, "ePBT ABS": 0 }],
};

const timelineBarProps = {
  data: exampleTimelineDataObject.months,
  indexBy: "month",
  keys: exampleTimelineDataObject.profiles,
};

const profileBreakdownProps = exampleTimelineDataObject.profiles.map((profile) => ({
  data: exampleTimelineDataObject.months,
  indexBy: "month",
  keys: [profile],
}));

const exampleBreakdownObject: TimelinesDataObject = {
  name: "biip",
  total: 15,
  profiles: ["ePBT", "GMK", "KAT", "MT3 PBT"],
  months: [{ month: "Feb 21", ePBT: 1, GMK: 1 }],
};

const seriesForLineGraphMap = exampleTimelineDataObject.profiles.map((profile) =>
  barDataToLineData(exampleTimelineDataObject.months, profile, "month", ["profile"])
);

export type TimelinesData<Optimised extends true | false = false> = Record<
  Categories,
  {
    months: string[];
    allProfiles: string[];
    summary: TimelinesDataObject<Optimised>;
    breakdown: Overwrite<
      Record<Properties, TimelinesDataObject<Optimised>>,
      { profile: { name: string; total: number } }
    >;
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
      };
      sunburst: StatusDataObjectSunburstChild[];
    };

const exampleStatusDataObjectSunburst: StatusDataObject = {
  name: "All",
  total: 799,
  pie: { ic: 306, preGb: 23, liveGb: 26, postGb: 444 },
  sunburst: [
    {
      id: "IC",
      children: [{ id: "GMK", val: 175 }],
    },
  ],
};

const sunburstProps = { data: exampleStatusDataObjectSunburst, value: "val" };

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

const exampleShippedDataObject: ShippedDataObject = {
  name: "GMK",
  total: 248,
  shipped: 99,
  unshipped: 149,
  months: [{ shipped: 5, unshipped: 1 }],
};

const shippedDataForLine = [
  barDataToLineData(exampleShippedDataObject.months, exampleShippedDataObject.name, "month", ["shipped"]),
  barDataToLineData(exampleShippedDataObject.months, exampleShippedDataObject.name, "month", ["unshipped"]),
];

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

const exampleDurationDataObject: CountDataObject = {
  name: "GMK",
  total: 263,
  mean: 30.16,
  median: 30,
  mode: [31],
  range: "13 - 60 (47)",
  standardDev: 5.39,
  data: [{ id: 31, count: 60 }],
};

const durationDataForLine = barDataToLineData(exampleDurationDataObject.data, exampleDurationDataObject.name, "id", [
  "count",
]);

export type DurationData<Optimised extends true | false = false> = Record<
  Categories,
  {
    summary: CountDataObject<Optimised>;
    breakdown: Record<Properties, CountDataObject<Optimised>[]>;
  }
>;

const exampleVendorDataObject: CountDataObject = {
  name: "GMK",
  total: 248,
  mean: 5.59,
  median: 5,
  mode: [5],
  range: "1 - 11 (10)",
  standardDev: 2.24,
  data: [{ id: 5, count: 60 }],
};

const vendorDataForLine = barDataToLineData(exampleVendorDataObject.data, exampleVendorDataObject.name, "id", [
  "count",
]);

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
