import type { IconPropT } from "@rmwc/types";
import type { Page } from "@s/router/types";
import { iconObject } from "@s/util/functions";
import {
  CalendarToday,
  Campaign,
  Collections,
  Favorites,
  Forum,
  HistoryEdu,
  Info,
  People,
  Settings,
  ShoppingBasket,
  Store,
  VisibilityOff,
} from "@i";

/**
 * Possible routes within the app
 * Key should be equal to /:key/, e.g. `test` for `/test` or `/test/:param?`
 */

export const routes = {
  archive: "/archive/:keyset?",
  audit: "/audit",
  bought: "/bought/:keyset?",
  calendar: "/calendar/:keyset?",
  favorites: "/favorites/:keyset?",
  guides: "/guides/:id?",
  hidden: "/hidden/:keyset?",
  history: "/history/:tab?",
  ic: "/ic/:keyset?",
  images: "/images",
  live: "/live/:keyset?",
  previous: "/previous/:keyset?",
  settings: "/settings",
  statistics: "/statistics/:tab?",
  timeline: "/timeline/:keyset?",
  updates: "/updates",
  users: "/users",
} as const;

const idPageList = <
  Pages extends [keyof typeof routes, ...(keyof typeof routes)[]]
>(
  ...pages: Pages
) => pages;

/** Pages which adhere to the normal calendar format. */

export const mainPages = idPageList(
  "archive",
  "bought",
  "calendar",
  "favorites",
  "hidden",
  "ic",
  "live",
  "previous",
  "timeline"
);

/** Main pages which can be accessed without being logged in. */

export const standardPages = idPageList(
  "calendar",
  "live",
  "ic",
  "previous",
  "timeline",
  "archive"
);

/** Pages which require being logged in. */

export const userPages = idPageList("favorites", "bought", "hidden");

export const adminPages = idPageList("audit", "users", "images");

/** Formatted page title to use within nav and app bar. */

export const pageTitle: Record<Page, string> = {
  archive: "Archive",
  audit: "Audit Log",
  bought: "Bought",
  calendar: "Calendar",
  favorites: "Favorites",
  guides: "Guides",
  hidden: "Hidden",
  history: "History",
  ic: "IC Tracker",
  images: "Images",
  live: "Live GBs",
  previous: "Previous Sets",
  settings: "Settings",
  statistics: "Statistics",
  timeline: "Timeline",
  updates: "Updates",
  users: "Users",
};

/** Corresponding icons for each page, to use in the nav drawer. */

export const pageIcons: Record<Page, IconPropT> = {
  archive: "all_inclusive",
  audit: iconObject(<HistoryEdu />),
  bought: iconObject(<ShoppingBasket />),
  calendar: iconObject(<CalendarToday />),
  favorites: iconObject(<Favorites />),
  guides: iconObject(<Info />),
  hidden: iconObject(<VisibilityOff />),
  history: "history",
  ic: iconObject(<Forum />),
  images: iconObject(<Collections />),
  live: iconObject(<Store />),
  previous: "history",
  settings: iconObject(<Settings />),
  statistics: "bar_chart",
  timeline: "timeline",
  updates: iconObject(<Campaign />),
  users: iconObject(<People />),
};
