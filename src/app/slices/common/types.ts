import type { allPages, mainPages } from "./constants";

/** Possible page names */

export type Page = typeof allPages[number];

/** Possible main page names */

export type MainPage = typeof mainPages[number];

export type ThemeMap = {
  background: string;
  dark: boolean;
  divider: string;
  elevatedSurface: string[];
  error: string;
  grey1: string;
  grey2: string;
  lighterDivider: string;
  meta: string;
  onError: string;
  onPrimary: string;
  onPrimaryDark: string;
  onPrimaryLight: string;
  onSecondary: string;
  onSecondaryDark: string;
  onSecondaryLight: string;
  onSurface: string;
  primary: string;
  primaryDark: string;
  primaryGradient: string[];
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryGradient: string[];
  secondaryLight: string;
  surface: string;
  textDisabled: string;
  textHigh: string;
  textMedium: string;
};

/** Theme variables with `on-` variants */
export type ThemeColorName =
  | "error"
  | "primary-dark"
  | "primary-light"
  | "primary"
  | "secondary-dark"
  | "secondary-light"
  | "secondary";
