import { Pages } from "./types";

/** Sort params which are dates. */

export const dateSorts = ["icDate", "gbLaunch", "gbEnd"] as const;

export const pages: Pages[] = [
  "calendar",
  "live",
  "ic",
  "previous",
  "timeline",
  "archive",
];
