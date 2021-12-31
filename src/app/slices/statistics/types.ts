import type { IChartistData } from "chartist";
import type { categories, properties, statsTabs } from "./constants";

export type Categories = typeof categories[number];

export type Properties = typeof properties[number];

export type Sorts = "alphabetical" | "total";

export type StatsTab = typeof statsTabs[number];

export type StatisticsType = {
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
  duration: Sorts | "duration";
  shipped: Sorts;
  status: Sorts;
  timelines: Sorts;
  vendors: Sorts;
};

export type TimelineDataObject = {
  name: string;
  timeline: {
    profiles: string[];
    series: IChartistData["series"];
  };
  total: number;
};

export type TimelinesData = Record<
  Categories,
  {
    allProfiles: string[];
    breakdown: Record<Properties, TimelineDataObject[]>;
    months: string[];
    summary: { breakdown: TimelineDataObject; count: TimelineDataObject };
  }
>;

export type StatusDataObject = {
  ic: number;
  liveGb: number;
  name: string;
  postGb: number;
  preGb: number;
  total: number;
};

export type StatusData = {
  breakdown: Record<Properties, StatusDataObject[]>;
  summary: StatusDataObject;
};

export type ShippedDataObject = {
  name: string;
  shipped: number;
  timeline: {
    shipped: IChartistData["series"][number];
    unshipped: IChartistData["series"][number];
  };
  total: number;
  unshipped: number;
};

export type ShippedData = {
  breakdown: Record<Properties, ShippedDataObject[]>;
  months: string[];
  summary: ShippedDataObject;
};

export type DurationDataObject = {
  chartData: IChartistData;
  mean: number;
  median: number;
  mode: number[];
  name: string;
  range: string;
  standardDev: number;
  total: number;
};

export type DurationData = Record<
  Categories,
  {
    breakdown: Record<Properties, DurationDataObject[]>;
    summary: DurationDataObject;
  }
>;

export type VendorDataObject = {
  chartData: IChartistData;
  mean: number;
  median: number;
  mode: number[];
  name: string;
  range: string;
  standardDev: number;
  total: number;
};

export type VendorData = {
  breakdown: Record<Properties, VendorDataObject[]>;
  summary: VendorDataObject;
};

export type StatisticsData = {
  duration: DurationData;
  shipped: ShippedData;
  status: StatusData;
  timelines: TimelinesData;
  vendors: VendorData;
};
