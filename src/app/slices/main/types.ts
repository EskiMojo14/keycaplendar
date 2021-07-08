import { allSorts } from "./constants";
import { Overwrite } from "@s/common/types";

/** Possible values for sort types. */

export type SortType = typeof allSorts[number];

/** Possible values for sort orders. */

export type SortOrderType = "ascending" | "descending";

/** Sort params which are dates. */

export type DateSortKeys = "icDate" | "gbLaunch" | "gbEnd";

/** Sort params which are arrays. */

export type ArraySortKeys = "designer";

export type VendorType = {
  id?: string;
  name: string;
  region: string;
  /** Direct URL to product. */
  storeLink?: string;
  endDate?: string;
};

export type SetType = {
  id: string;
  alias: string;
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

export type SetGroup = { title: string; sets: SetType[] };

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
  /** Whether to filter to only favorites. */
  favorites: boolean;
  /** Whether to filter to only bought sets. */
  bought: boolean;
  /** Whether to filter to only hidden sets, unhidden sets, or show all. */
  hidden: "unhidden" | "hidden" | "all";
};

export type PresetType = {
  name: string;
  id: string;
  global?: boolean;
  whitelist: WhitelistType;
};

export type OldPresetType = Overwrite<
  PresetType,
  {
    whitelist: Overwrite<
      WhitelistType,
      {
        regions?: string[];
        bought?: boolean;
        hidden: boolean | "hidden" | "unhidden" | "all";
      }
    >;
  }
>;
