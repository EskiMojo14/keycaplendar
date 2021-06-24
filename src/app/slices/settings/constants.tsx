import React from "react";
import { IconPropT } from "@rmwc/types";
import { iconObject } from "@s/common/functions";
import { ViewType } from "./types";

/** All possible views. */

export const allViews = ["card", "list", "imageList", "compact"] as const;

/** Formatted names for each main view. */

export const viewNames: Record<ViewType, string> = {
  card: "Card",
  list: "List",
  imageList: "Image List",
  compact: "Compact",
};

/** Corresponding icon for specified view, to be used in the app bar. */

export const viewIcons: Record<ViewType, IconPropT> = {
  card: iconObject(
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M4 5h3v13H4zm14 0h3v13h-3zM8 18h9V5H8v13zm2-11h5v9h-5V7z" />
        <path d="M10 7h5v9h-5z" opacity=".3" />
      </svg>
    </div>
  ),
  list: iconObject(
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" opacity=".87" />
        <path d="M5 11h2v2H5zm0 4h2v2H5zm0-8h2v2H5zm4 0h9v2H9zm0 8h9v2H9zm0-4h9v2H9z" opacity=".3" />
        <path d="M3 5v14h17V5H3zm4 12H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V7h2v2zm11 8H9v-2h9v2zm0-4H9v-2h9v2zm0-4H9V7h9v2z" />
      </svg>
    </div>
  ),
  imageList: iconObject(
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
          d="M11 12.5h3V16h-3zM11 7h3v3.5h-3zm-5 5.5h3V16H6zM6 7h3v3.5H6zm10 0h3v3.5h-3zm0 5.5h3V16h-3z"
          opacity=".3"
        />
        <path d="M4 5v13h17V5H4zm5 11H6v-3.5h3V16zm0-5.5H6V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5z" />
      </svg>
    </div>
  ),
  compact: iconObject(
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M6 7h3v9H6zm5 0h3v9h-3zm5 0h3v9h-3z" opacity=".3" />
        <path d="M4 5v13h17V5H4zm5 11H6V7h3v9zm5 0h-3V7h3v9zm5 0h-3V7h3v9z" />
      </svg>
    </div>
  ),
};
