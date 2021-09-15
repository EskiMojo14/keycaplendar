import { IChartistData } from "chartist";
import { VendorType } from "../main/types";

export type StatisticsSetType = {
  id: string;
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
