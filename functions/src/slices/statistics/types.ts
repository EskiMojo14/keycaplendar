import { Overwrite } from "../common/types";
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

export type TimelinesDataObject = {
  name: string;
  total: number;
  profiles: string[];
  months: Record<string, number>[];
};

export type TimelinesData = Record<
  Categories,
  {
    months: string[];
    allProfiles: string[];
    summary: TimelinesDataObject;
    breakdown: Overwrite<Record<Properties, TimelinesDataObject>, { profile: { name: string; total: number } }>;
  }
>;

export type StatusDataObjectSunburstDatum = { id: string; index?: number; val: number };

export type StatusDataObjectSunburstChildWithChild = {
  id?: string;
  index?: number;
  children: (StatusDataObjectSunburstDatum | StatusDataObjectSunburstChild)[];
};

export type StatusDataObjectSunburstChild = StatusDataObjectSunburstChildWithChild | StatusDataObjectSunburstDatum;

export type StatusDataObject = {
  name: string;
  total: number;
  pie: {
    ic?: number;
    preGb?: number;
    liveGb?: number;
    postGb?: number;
  };
  sunburst?: StatusDataObjectSunburstChild[];
};

export type StatusData = {
  summary: StatusDataObject;
  breakdown: Record<Properties, StatusDataObject[]>;
};

export type ShippedDataObject = {
  name: string;
  total: number;
  shipped?: number;
  unshipped?: number;
  months: { month?: string; index?: number; shipped?: number; unshipped?: number }[];
};

export type ShippedData = {
  summary: ShippedDataObject;
  months: string[];
  breakdown: Record<Properties, ShippedDataObject[]>;
};

export type CountDataObject = {
  name: string;
  total: number;
  mean?: number;
  median?: number;
  mode?: number[];
  range?: string;
  standardDev?: number;
  data: { id: number; count: number; index?: number }[];
};

export type DurationData = Record<
  Categories,
  {
    summary: CountDataObject;
    breakdown: Record<Properties, CountDataObject[]>;
  }
>;

export type VendorData = {
  summary: CountDataObject;
  breakdown: Record<Properties, CountDataObject[]>;
};
