import type { ReactNode } from "react";
import type { IconOptions, IconPropT } from "@rmwc/types";
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
import type { Page, ThemeMap } from "./types";

/**
 * Converts JSX to RMWC icon object parameter.
 * *Copied to constants file to prevent circular import.*
 * @param jsx JSX of icon component.
 * @returns Object with `strategy` set to `"component"` and `icon` set to the value of `jsx`.
 */

const iconObject = (
  jsx: ReactNode,
  config?: Omit<IconOptions, "icon">
): IconPropT => ({
  icon: jsx,
  strategy: "component",
  ...config,
});

/** Character replacements to be used in `replaceFunction`. */

export const replaceChars: [searchValue: string, replaceValue: string][] = [
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

export const standardPages: Page[] = [
  "calendar",
  "live",
  "ic",
  "previous",
  "timeline",
  "archive",
];

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

export const blankTheme: ThemeMap = {
  background: "",
  dark: false,
  divider: "",
  elevatedSurface: Array(25).fill(""),
  error: "",
  grey1: "",
  grey2: "",
  lighterDivider: "",
  meta: "",
  onError: "",
  onPrimary: "",
  onPrimaryDark: "",
  onPrimaryLight: "",
  onSecondary: "",
  onSecondaryDark: "",
  onSecondaryLight: "",
  onSurface: "",
  primary: "",

  primaryDark: "",
  primaryGradient: Array(10).fill(""),
  primaryLight: "",

  secondary: "",
  secondaryDark: "",
  secondaryGradient: Array(10).fill(""),
  secondaryLight: "",
  surface: "",

  textDisabled: "",
  textHigh: "",
  textMedium: "",
};

const createThemeList = (prefix: string, list: string, length: number) =>
  Array(length)
    .fill("")
    .map((_, index) => `var(--${prefix}-${list}${index + 1})`);

export const themeLists = {
  elevatedSurface: createThemeList("theme", "elevated-surface", 25),
  primary: createThemeList("theme", "primary-gradient", 10),
  secondary: createThemeList("theme", "secondary-gradient", 10),
};

export const graphColors = {
  heatmap: createThemeList("graph-color", "heatmap", 8),
  rainbow: createThemeList("graph-color", "rainbow", 38),
};
