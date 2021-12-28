import type { visibilityVals } from "./constants";

export type Visibility = typeof visibilityVals[number];

export type GuideEntryType = {
  id: string;
  /** The author of the update. */
  name: string;
  title: string;
  description: string;
  tags: string[];
  body: string;
  visibility: Visibility;
};
