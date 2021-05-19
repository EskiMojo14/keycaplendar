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

export type TimelineDataObject = {
  name: string;
  total: number;
  timeline: {
    months: string[];
    profiles: string[];
    series:
      | {
          meta: string;
          value: number;
        }[][]
      | number[][];
  };
};

export type CountDataObject = {
  total: number;
  months: string[];
  series: number[][];
};

export type SummaryData = {
  count: Record<Categories, CountDataObject>;
  profile: Record<Categories, { profiles: string[]; data: TimelineDataObject }>;
};

export type TimelinesData = Record<Categories, Record<Properties, { profiles: string[]; data: TimelineDataObject[] }>>;

export type StatusDataObject = {
  ic: number;
  liveGb: number;
  name: string;
  postGb: number;
  preGb: number;
  total: number;
};

export type StatusData = Record<Properties, StatusDataObject[]>;

export type ShippedDataObject = {
  name: string;
  shipped: number;
  total: number;
  unshipped: number;
  timeline: {
    months: string[];
    series: {
      [key: string]: {
        meta: string;
        value: number;
      };
    }[];
  };
};

export type ShippedData = Record<Properties, ShippedDataObject[]>;

export type DurationDataObject = {
  chartData: number[][];
  mean: number;
  median: number;
  mode: number[];
  name: string;
  range: string;
  standardDev: number;
  total: number;
};

export type DurationData = Record<Categories, Record<Properties, DurationDataObject[]>>;

export type VendorDataObject = {
  chartData: number[][];
  mean: number;
  median: number;
  mode: number[];
  name: string;
  range: string;
  standardDev: number;
  total: number;
};

export type VendorData = Record<Properties, VendorDataObject[]>;

export type StatisticsData = {
  summaryData: SummaryData;
  timelinesData: TimelinesData;
  statusData: StatusData;
  shippedData: ShippedData;
  durationData: DurationData;
  vendorsData: VendorData;
};
