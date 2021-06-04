/** Sort params which are dates. */

export type DateSortKeys = "icDate" | "gbLaunch" | "gbEnd";

export type VendorType = {
  id?: string;
  name: string;
  region: string;
  storeLink?: string;
  endDate?: string;
};

export type SetType = {
  id: string;
  alias: string;
  latestEditor: string;
  colorway: string;
  designer: string[];
  details: string;
  notes?: string;
  gbEnd: string;
  gbLaunch: string;
  gbMonth?: boolean;
  icDate: string;
  image: string;
  profile: string;
  sales?: {
    /** Direct URL to sales graph. */
    img: string;
    thirdParty: boolean;
  };
  shipped?: boolean;
  vendors?: VendorType[];
};
