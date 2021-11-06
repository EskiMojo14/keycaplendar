import { ReactNode } from "react";
import { IconOptions, IconPropT } from "@rmwc/types";
import { Page, ThemeMap } from "./types";
import {
  CalendarToday,
  Store,
  Forum,
  Favorites,
  ShoppingBasket,
  VisibilityOff,
  HistoryEdu,
  People,
  Collections,
  Info,
  Campaign,
  Settings,
} from "@i";

/**
 * Converts JSX to RMWC icon object parameter.
 * *Copied to constants file to prevent circular import.*
 * @param jsx JSX of icon component.
 * @returns Object with `strategy` set to `"component"` and `icon` set to the value of `jsx`.
 */

const iconObject = (jsx: ReactNode, config?: Omit<IconOptions, "icon">): IconPropT => ({
  strategy: "component",
  icon: jsx,
  ...config,
});

/** Character replacements to be used in `replaceFunction`. */

export const replaceChars: [string, string][] = [
  ["β", "B"],
  ["æ", "ae"],
  ["🅱️", "B"],
];

/** All possible pages. */

export const allPages = [
  "calendar",
  "live",
  "ic",
  "previous",
  "timeline",
  "archive",
  "favorites",
  "bought",
  "hidden",
  "statistics",
  "history",
  "audit",
  "users",
  "images",
  "guides",
  "updates",
  "settings",
] as const;

/** Pages which adhere to the normal calendar format. */

export const mainPages = [
  "calendar",
  "live",
  "ic",
  "previous",
  "timeline",
  "archive",
  "favorites",
  "bought",
  "hidden",
] as const;

/** Main pages which can be accessed without being logged in. */

export const standardPages: Page[] = ["calendar", "live", "ic", "previous", "timeline", "archive"];

/** Pages to allow linking to using URL params or path. (e.g. {@link https://keycaplendar.firebaseapp.com/ic} or {@link https://keycaplendar.firebaseapp.com/?page=ic}). */

export const urlPages: Page[] = [
  "calendar",
  "live",
  "ic",
  "previous",
  "timeline",
  "archive",
  "statistics",
  "history",
  "guides",
  "updates",
  "settings",
];

/** Pages which require being logged in. */

export const userPages: Page[] = ["favorites", "bought", "hidden"];

/** Pages which can only be used by users with the admin permission. */

export const adminPages: Page[] = ["audit", "users", "images"];

/** Formatted page title to use within nav and app bar. */

export const pageTitle: Record<Page, string> = {
  calendar: "Calendar",
  live: "Live GBs",
  ic: "IC Tracker",
  previous: "Previous Sets",
  timeline: "Timeline",
  archive: "Archive",
  favorites: "Favorites",
  bought: "Bought",
  hidden: "Hidden",
  statistics: "Statistics",
  history: "History",
  audit: "Audit Log",
  users: "Users",
  images: "Images",
  guides: "Guides",
  updates: "Updates",
  settings: "Settings",
};

/** Corresponding icons for each page, to use in the nav drawer. */

export const pageIcons: Record<Page, IconPropT> = {
  calendar: iconObject(<CalendarToday />),
  live: iconObject(<Store />),
  ic: iconObject(<Forum />),
  previous: "history",
  timeline: "timeline",
  archive: "all_inclusive",
  favorites: iconObject(<Favorites />),
  bought: iconObject(<ShoppingBasket />),
  hidden: iconObject(<VisibilityOff />),
  statistics: "bar_chart",
  history: "history",
  audit: iconObject(<HistoryEdu />),
  users: iconObject(<People />),
  images: iconObject(<Collections />),
  guides: iconObject(<Info />),
  updates: iconObject(<Campaign />),
  settings: iconObject(<Settings />),
};

export const blankTheme: ThemeMap = {
  dark: false,

  background: "",
  primary: "",
  onPrimary: "",
  primaryDark: "",
  onPrimaryDark: "",
  primaryLight: "",
  onPrimaryLight: "",
  secondary: "",
  onSecondary: "",
  secondaryDark: "",
  onSecondaryDark: "",
  secondaryLight: "",
  onSecondaryLight: "",
  error: "",
  onError: "",
  surface: "",
  onSurface: "",

  textHigh: "",
  textMedium: "",
  textDisabled: "",

  meta: "",
  divider: "",
  lighterDivider: "",
  grey1: "",
  grey2: "",

  primaryGradient: Array(10).fill(""),
  secondaryGradient: Array(10).fill(""),
  elevatedSurface: Array(25).fill(""),
};

const createThemeList = (prefix: string, list: string, length: number) =>
  Array(length)
    .fill("")
    .map((_, index) => `var(--${prefix}-${list}${index + 1})`);

export const themeLists = {
  primary: createThemeList("theme", "primary-gradient", 10),
  secondary: createThemeList("theme", "secondary-gradient", 10),
  elevatedSurface: createThemeList("theme", "elevated-surface", 25),
};

export const graphColors = {
  rainbow: createThemeList("graph-color", "rainbow", 38),
  heatmap: createThemeList("graph-color", "heatmap", 8),
};
