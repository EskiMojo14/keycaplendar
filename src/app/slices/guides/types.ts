import type { visibilityVals } from "./constants";

export type Visibility = typeof visibilityVals[number];

export type GuideEntryType = {
  body: string;
  description: string;
  id: string;
  /** The author of the update. */
  name: string;
  tags: string[];
  title: string;
  visibility: Visibility;
};
