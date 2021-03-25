export type VendorType = {
  id?: string;
  name: string;
  region: string;
  storeLink?: string;
  endDate?: string;
};

export type SetType = {
  colorway: string;
  designer: string[];
  details: string;
  gbEnd: string;
  gbLaunch: string;
  gbMonth?: boolean;
  icDate: string;
  id: string;
  image: string;
  profile: string;
  sales?: { img: string; thirdParty: boolean };
  shipped?: boolean;
  vendors?: VendorType[];
};

export type Categories = "icDate" | "gbLaunch";

export type Properties = "profile" | "designer" | "vendor";

export type Sorts = "total" | "alphabetical";

export type StatisticsSortType = {
  timelines: Sorts;
  status: Sorts;
  shipped: Sorts;
  duration: Sorts | "duration";
  vendors: Sorts;
};
