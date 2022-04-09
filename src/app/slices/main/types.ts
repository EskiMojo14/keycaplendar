import type { EntityId } from "@reduxjs/toolkit";
import type { Overwrite } from "@s/util/types";
import type { allSorts } from "./constants";

/** Possible values for sort types. */

export type SortType = typeof allSorts[number];

/** Possible values for sort orders. */

export type SortOrderType = "ascending" | "descending";

/** Sort params which are dates. */

export type DateSortKeys = "gbEnd" | "gbLaunch" | "icDate";

/** Sort params which are arrays. */

export type ArraySortKeys = "designer";

export type VendorType = {
  name: string;
  region: string;
  endDate?: string;
  id?: string;
  /** Direct URL to product. */
  storeLink?: string;
};

export type SetType = {
  alias: string;
  colorway: string;
  designer: string[];
  details: string;
  gbEnd: string;
  gbLaunch: string;
  gbMonth: boolean;
  icDate: string;
  id: string;
  image: string;
  notes: string;
  profile: string;
  sales: {
    /** Direct URL to sales graph. */
    img: string;
    thirdParty: boolean;
  };
  shipped: boolean;
  vendors: VendorType[];
};

export type SetGroup = { sets: EntityId[]; title: string };

export type WhitelistType = {
  /** Whether to filter to only bought sets. */
  bought: boolean;
  /** Whether to filter to only favorites. */
  favorites: boolean;
  /** Whether to filter to only hidden sets, unhidden sets, or show all. */
  hidden: "all" | "hidden" | "unhidden";
  /** Array of allowed profiles. */
  profiles: string[];
  /** Regions to include. */
  regions: string[];
  /** Array of allowed shipped values. */
  shipped: ("Not shipped" | "Shipped")[];
  /** Whether to `include` or `exclude` the specified `vendors`. */
  vendorMode: "exclude" | "include";
  /** Array of vendors to either `include` or `exclude`. */
  vendors: string[];
  /** Array of all keys that have been edited. */
  edited?: string[];
};

export type PresetType = {
  id: string;
  name: string;
  whitelist: WhitelistType;
  global?: boolean;
};

export type OldPresetType = Overwrite<
  PresetType,
  {
    whitelist: Overwrite<
      WhitelistType,
      {
        hidden: boolean | "all" | "hidden" | "unhidden";
        bought?: boolean;
        regions?: string[];
      }
    >;
  }
>;
