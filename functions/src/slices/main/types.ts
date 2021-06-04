/** Sort params which are dates. */

import { Overwrite } from "../common/types";

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

export type WhitelistType = {
  /** Array of allowed profiles. */
  profiles: string[];
  /** Array of allowed shipped values. */
  shipped: ("Shipped" | "Not shipped")[];
  /** Regions to include. */
  regions: string[];
  /** Whether to `include` or `exclude` the specified `vendors`. */
  vendorMode: "include" | "exclude";
  /** Array of vendors to either `include` or `exclude`. */
  vendors: string[];
  /** Array of all keys that have been edited. */
  edited?: string[];
  /** Whether to filter to only favourites. */
  favorites: boolean;
  /** Whether to filter to only bought sets. */
  bought: boolean;
  /** Whether to filter to only hidden sets. */
  hidden: boolean;
};

export type PresetType = {
  name: string;
  id: string;
  global?: boolean;
  whitelist: WhitelistType;
};

export type OldPresetType = Overwrite<
  PresetType,
  { whitelist: Overwrite<WhitelistType, { regions?: string[]; bought?: boolean }> }
>;
