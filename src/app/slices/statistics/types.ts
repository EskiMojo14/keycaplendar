import type { IChartistData } from "chartist";
import type { categories, properties, statsTabs } from "./constants";

export type Categories = typeof categories[number];

export type Properties = typeof properties[number];

export type Sorts = "alphabetical" | "total";

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

export type TimelineDataObject = {
  name: string;
  total: number;
  timeline: {
    profiles: string[];
    series: IChartistData["series"];
  };
};

export type TimelinesData = Record<
  Categories,
  {
    summary: { count: TimelineDataObject; breakdown: TimelineDataObject };
    breakdown: Record<Properties, TimelineDataObject[]>;
    allProfiles: string[];
    months: string[];
  }
>;

export type StatusDataObject = {
  name: string;
  total: number;
  ic: number;
  liveGb: number;
  postGb: number;
  preGb: number;
};

export type StatusData = {
  summary: StatusDataObject;
  breakdown: Record<Properties, StatusDataObject[]>;
};

export type ShippedDataObject = {
  name: string;
  total: number;
  shipped: number;
  unshipped: number;
  timeline: {
    shipped: IChartistData["series"][number];
    unshipped: IChartistData["series"][number];
  };
};

export type ShippedData = {
  summary: ShippedDataObject;
  months: string[];
  breakdown: Record<Properties, ShippedDataObject[]>;
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
    summary: DurationDataObject;
    breakdown: Record<Properties, DurationDataObject[]>;
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
  summary: VendorDataObject;
  breakdown: Record<Properties, VendorDataObject[]>;
};

export type StatisticsData = {
  timelines: TimelinesData;
  status: StatusData;
  shipped: ShippedData;
  duration: DurationData;
  vendors: VendorData;
};
