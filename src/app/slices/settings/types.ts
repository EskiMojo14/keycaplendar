import type { allViews } from "./constants";

/** Possible values for view. */

export type ViewType = typeof allViews[number];

export type Settings = {
  view: ViewType;
  bottomNav: boolean;
  applyTheme: string;
  lightTheme: string;
  darkTheme: string;
  manualTheme: boolean;
  fromTimeTheme: string;
  toTimeTheme: string;
  density: string;
};
