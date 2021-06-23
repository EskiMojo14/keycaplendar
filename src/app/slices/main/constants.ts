import { MainPage, Page } from "@s/common/types";
import { SortOrderType, SortType } from "./types";

/** Default sorts for each page. */

export const pageSort: Record<MainPage, SortType> = {
  calendar: "gbLaunch",
  live: "gbEnd",
  ic: "icDate",
  previous: "gbEnd",
  timeline: "gbLaunch",
  archive: "profile",
  favorites: "profile",
  bought: "profile",
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
  bought: "ascending",
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
  vendor: [],
  icDate: [],
  gbLaunch: ["ic"],
  gbEnd: ["ic"],
};

/** Pages to check for hidden sets due to sort. */

export const sortHiddenCheck: Record<SortType, Page[]> = {
  profile: [],
  designer: [],
  vendor: ["ic", "archive", "favorites", "bought", "hidden"],
  icDate: [],
  gbLaunch: ["archive", "favorites", "bought", "hidden"],
  gbEnd: ["timeline", "archive", "favorites", "bought", "hidden"],
};

/** Sort params which are dates. */

export const dateSorts = ["icDate", "gbLaunch", "gbEnd"] as const;

/** Sort params which are arrays. */

export const arraySorts = ["designer"] as const;

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
