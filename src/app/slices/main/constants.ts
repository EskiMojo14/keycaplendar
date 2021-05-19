/** Default sorts for each page. */

import { MainPage, Page } from "../common/types";
import { SortOrderType, SortType } from "./types";

export const pageSort: Record<MainPage, SortType> = {
  calendar: "gbLaunch",
  live: "gbEnd",
  ic: "icDate",
  previous: "gbEnd",
  timeline: "gbLaunch",
  archive: "profile",
  favorites: "profile",
  hidden: "profile",
};

/** Default sort orders for each page. */

export const pageSortOrder: Record<MainPage, SortOrderType> = {
  calendar: "ascending",
  live: "ascending",
  ic: "descending",
  previous: "descending",
  timeline: "ascending",
  archive: "ascending",
  favorites: "ascending",
  hidden: "ascending",
};

/** Pages to default to descending sort order if specified sort is a date. */

export const reverseSortDatePages: Page[] = ["ic", "previous"];

/** All possible sort types. */

export const allSorts = ["profile", "designer", "vendor", "icDate", "gbLaunch", "gbEnd"] as const;

/** Formatted names for each sort. */

export const sortNames: Record<SortType, string> = {
  profile: "Profile",
  designer: "Designer",
  vendor: "Vendor",
  icDate: "IC date",
  gbLaunch: "Start date",
  gbEnd: "End date",
};

/** Pages to *not* show specified sort on. */

export const sortBlacklist: Record<SortType, Page[]> = {
  profile: [],
  designer: [],
  vendor: ["ic", "archive", "favorites", "hidden"],
  icDate: [],
  gbLaunch: ["ic", "archive", "favorites", "hidden"],
  gbEnd: ["ic", "timeline", "archive", "favorites", "hidden"],
};

/** Sort params which are dates. */

export const dateSorts: SortType[] = ["icDate", "gbLaunch", "gbEnd"];

/** Sort params which are arrays. */

export const arraySorts: SortType[] = ["designer"];

/** Possible values for shipped whitelist items. */

export const whitelistShipped = ["Shipped", "Not shipped"] as const;

/** Whitelist params which can be specified in the URL (e.g. {@link https://keycaplendar.firebaseapp.com/?profile=GMK}) */

export const whitelistParams = [
  "profile",
  "profiles",
  "shipped",
  "region",
  "regions",
  "vendorMode",
  "vendor",
  "vendors",
] as const;
