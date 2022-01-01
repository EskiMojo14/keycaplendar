import type { IconPropT } from "@rmwc/types";
import { iconObject } from "@s/util/functions";
import { GridView, ViewArray, ViewColumn, ViewList } from "@i";
import type { ViewType } from "./types";

/** All possible views. */

export const allViews = ["card", "list", "imageList", "compact"] as const;

/** Formatted names for each main view. */

export const viewNames: Record<ViewType, string> = {
  card: "Card",
  compact: "Compact",
  imageList: "Image List",
  list: "List",
};

/** Corresponding icon for specified view, to be used in the app bar. */

export const viewIcons: Record<ViewType, IconPropT> = {
  card: iconObject(<ViewArray />),
  compact: iconObject(<ViewColumn />),
  imageList: iconObject(<GridView />),
  list: iconObject(<ViewList />),
};
