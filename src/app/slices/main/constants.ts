import type { MainPage, Page } from "@s/router/types";
import type {
  PresetType,
  SetType,
  SortOrderType,
  SortType,
  WhitelistType,
} from "./types";

export const blankWhitelist: WhitelistType = {
  bought: false,
  favorites: false,
  hidden: "unhidden",
  profiles: [],
  regions: [],
  shipped: ["Shipped", "Not shipped"],
  vendorMode: "exclude",
  vendors: [],
};

export const blankPreset: PresetType = {
  global: false,
  id: "",
  name: "",
  whitelist: blankWhitelist,
};

export const blankKeyset: SetType = {
  alias: "",
  colorway: "",
  designer: [],
  details: "",
  gbEnd: "",
  gbLaunch: "",
  gbMonth: false,
  icDate: "",
  id: "",
  image: "",
  latestEditor: "",
  notes: "",
  profile: "",
  sales: {
    img: "",
    thirdParty: false,
  },
  shipped: false,
  vendors: [],
};

/** Default sorts for each page. */

export const defaultSorts: Record<
  MainPage,
  { sort: SortType; sortOrder: SortOrderType }
> = {
  archive: {
    sort: "profile",
    sortOrder: "ascending",
  },
  bought: {
    sort: "profile",
    sortOrder: "ascending",
  },
  calendar: {
    sort: "gbLaunch",
    sortOrder: "ascending",
  },
  favorites: {
    sort: "profile",
    sortOrder: "ascending",
  },
  hidden: {
    sort: "profile",
    sortOrder: "ascending",
  },
  ic: {
    sort: "icDate",
    sortOrder: "descending",
  },
  live: {
    sort: "gbEnd",
    sortOrder: "ascending",
  },
  previous: {
    sort: "gbEnd",
    sortOrder: "descending",
  },
  timeline: {
    sort: "gbLaunch",
    sortOrder: "ascending",
  },
};

/** Pages where hidden setting is ignored. */

export const showAllPages: Page[] = ["favorites", "bought"];

/** Pages to default to descending sort order if specified sort is a date. */

export const reverseSortDatePages: Page[] = ["ic", "previous"];

/** All possible sort types. */

export const allSorts = [
  "profile",
  "designer",
  "vendor",
  "icDate",
  "gbLaunch",
  "gbEnd",
] as const;

/** Formatted names for each sort. */

export const sortNames: Record<SortType, string> = {
  designer: "Designer",
  gbEnd: "End date",
  gbLaunch: "Start date",
  icDate: "IC date",
  profile: "Profile",
  vendor: "Vendor",
};

/** Pages to *not* show specified sort on. */

export const sortBlacklist: Record<SortType, Page[]> = {
  designer: ["calendar"],
  gbEnd: ["calendar", "ic"],
  gbLaunch: ["ic"],
  icDate: ["calendar"],
  profile: ["calendar"],
  vendor: ["calendar"],
};

/** Pages to check for hidden sets due to sort. */

export const sortHiddenCheck: Record<SortType, Page[]> = {
  designer: [],
  gbEnd: ["timeline", "archive", "favorites", "bought", "hidden"],
  gbLaunch: ["archive", "favorites", "bought", "hidden"],
  icDate: [],
  profile: [],
  vendor: ["ic", "archive", "favorites", "bought", "hidden"],
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
  "profiles", // legacy
  "shipped",
  "region",
  "regions", // legacy
  "vendorMode",
  "vendor",
  "vendors", // legacy
] as const;
