import type { allViews } from "./constants";

/** Possible values for view. */

export type ViewType = typeof allViews[number];

export type Settings = {
  applyTheme: string;
  bottomNav: boolean;
  darkTheme: string;
  density: string;
  fromTimeTheme: string;
  lightTheme: string;
  manualTheme: boolean;
  toTimeTheme: string;
  view: ViewType;
};
