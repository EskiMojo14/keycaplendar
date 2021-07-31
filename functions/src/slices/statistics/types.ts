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

export type ChartDatumObject = {
  meta: string;
  value: number;
};

export type ChartSeriesItem = ChartDatumObject | number | null | undefined;

export type ChartData = ChartSeriesItem[][] | { data: ChartSeriesItem[]; className?: string }[];

export type TimelineDataObject = {
  name: string;
  total: number;
  timeline: {
    months: string[];
    profiles: string[];
    series: ChartData;
  };
};

export type CountDataObject = {
  total: number;
  months: string[];
  series: ChartData;
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
    series: Record<string, ChartDatumObject>[];
  };
};

export type ShippedData = Record<Properties, ShippedDataObject[]>;

export type DurationDataObject = {
  chartData: ChartData;
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
  chartData: ChartData;
  mean: number;
  median: number;
  mode: number[];
  name: string;
  range: string;
  standardDev: number;
  total: number;
};

export type VendorData = Record<Properties, VendorDataObject[]>;
