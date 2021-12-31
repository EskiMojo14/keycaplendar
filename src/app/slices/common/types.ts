import type { allPages, mainPages } from "./constants";

/** Possible page names */

export type Page = typeof allPages[number];

/** Possible main page names */

export type MainPage = typeof mainPages[number];

export type ThemeMap = {
  background: string;
  dark: boolean;
  error: string;
  onError: string;
  onPrimary: string;
  onSecondary: string;
  onSurface: string;
  primary: string;
  secondary: string;
  surface: string;
};
