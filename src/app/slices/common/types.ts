import { allPages, mainPages } from "./constants";

/** Possible page names */

export type Page = typeof allPages[number];

/** Possible main page names */

export type MainPage = typeof mainPages[number];

export type ThemeMap = {
  dark: boolean;

  background: string;
  primary: string;
  onPrimary: string;
  primaryDark: string;
  onPrimaryDark: string;
  primaryLight: string;
  onPrimaryLight: string;
  secondary: string;
  onSecondary: string;
  secondaryDark: string;
  onSecondaryDark: string;
  secondaryLight: string;
  onSecondaryLight: string;
  error: string;
  onError: string;
  surface: string;
  onSurface: string;

  textHigh: string;
  textMedium: string;
  textDisabled: string;

  meta: string;
  divider: string;
  lighterDivider: string;
  grey1: string;
  grey2: string;

  primaryGradient: string[];
  secondaryGradient: string[];
  elevatedSurface: string[];
};
