export type VendorType = {
  id?: string;
  name: string;
  region: string;
  storeLink?: string;
  endDate?: string;
};

export type StatisticsSetType = {
  colorway: string;
  designer: string[];
  gbEnd: string;
  gbLaunch: string;
  icDate: string;
  id: string;
  profile: string;
  shipped?: boolean;
  vendors?: VendorType[];
};

export type Categories = "icDate" | "gbLaunch";

export type Properties = "profile" | "designer" | "vendor";
