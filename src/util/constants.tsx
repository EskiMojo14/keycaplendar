import React from "react";
import * as RMWC from "@rmwc/types";
import { iconObject } from "./functions";
import { SortOrderType } from "./types";

export const replaceChars: [string, string][] = [
  ["β", "B"],
  ["æ", "ae"],
  ["🅱️", "B"],
];

export const settingsFunctions: { [key: string]: string } = {
  view: "setView",
  bottomNav: "setBottomNav",
  applyTheme: "setApplyTheme",
  lightTheme: "setLightTheme",
  darkTheme: "setDarkTheme",
  manualTheme: "setManualTheme",
  fromTimeTheme: "setFromTimeTheme",
  toTimeTheme: "setToTimeTheme",
  density: "setDensity",
};

export const mainPages: string[] = ["calendar", "live", "ic", "previous", "timeline", "archive", "favorites", "hidden"];

export const standardPages: string[] = ["calendar", "live", "ic", "previous", "timeline", "archive"];

export const urlPages: string[] = [
  "calendar",
  "live",
  "ic",
  "previous",
  "timeline",
  "archive",
  "statistics",
  "settings",
];

export const userPages: string[] = ["favorites", "hidden"];

export const adminPages: string[] = ["audit", "users", "images"];

export const pageTitle: { [key: string]: string } = {
  calendar: "Calendar",
  live: "Live GBs",
  ic: "IC Tracker",
  previous: "Previous Sets",
  account: "Account",
  timeline: "Timeline",
  archive: "Archive",
  favorites: "Favorites",
  hidden: "Hidden",
  statistics: "Statistics",
  audit: "Audit Log",
  users: "Users",
  images: "Images",
  settings: "Settings",
};

export const pageIcons: { [key: string]: RMWC.IconPropT } = {
  calendar: iconObject(
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" />
      <path d="M4 5.01h16V8H4z" opacity=".3" />
    </svg>
  ),
  live: iconObject(
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M5.64 9l-.6 3h13.92l-.6-3z" opacity=".3" />
      <path d="M4 4h16v2H4zm16 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zm-8 11H6v-4h6v4zm-6.96-6l.6-3h12.72l.6 3H5.04z" />
    </svg>
  ),
  ic: iconObject(
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M15 11V4H4v8.17L5.17 11H6z" opacity=".3" />
      <path d="M16 13c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10zm-12-.83V4h11v7H5.17L4 12.17zM22 7c0-.55-.45-1-1-1h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7z" />
    </svg>
  ),
  previous: "history",
  timeline: "timeline",
  archive: "all_inclusive",
  favorites: iconObject(
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
      <path d="M0,0h24v24H0V0z" fill="none" />
      <path d="M12,21.1C5.4,15.2,1.5,11.7,1.5,7c0-0.2,0-0.4,0-0.6c-0.6,0.9-1,2-1,3.2c0,3.8,3.4,6.9,10,12.8L12,21.1z" />
      <path
        d="M18,3.6c-1.5,0-3,1-3.6,2.4h-1.9C12,4.6,10.5,3.6,9,3.6c-2,0-3.5,1.5-3.5,3.5
	c0,2.9,3.1,5.7,7.9,10l0.1,0.1l0.1-0.1c4.8-4.3,7.9-7.2,7.9-10C21.5,5.1,20,3.6,18,3.6z"
        opacity=".3"
      />
      <path
        d="M18,1.6c-1.7,0-3.4,0.8-4.5,2.1C12.4,2.4,10.7,1.6,9,1.6C5.9,1.6,3.5,4,3.5,7.1c0,3.8,3.4,6.9,8.6,11.5l1.4,1.3l1.4-1.3
	c5.2-4.7,8.6-7.8,8.6-11.5C23.5,4,21.1,1.6,18,1.6z M13.6,17.2l-0.1,0.1l-0.1-0.1c-4.8-4.3-7.9-7.2-7.9-10c0-2,1.5-3.5,3.5-3.5
	c1.5,0,3,1,3.6,2.4h1.9c0.5-1.4,2-2.4,3.6-2.4c2,0,3.5,1.5,3.5,3.5C21.5,10,18.4,12.9,13.6,17.2z"
      />
    </svg>
  ),
  hidden: iconObject(
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
      <path d="M0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none" />
      <path
        d="M12 14c.04 0 .08-.01.12-.01l-2.61-2.61c0 .04-.01.08-.01.12 0 1.38 1.12 2.5 2.5 2.5zm1.01-4.79l1.28 1.28c-.26-.57-.71-1.03-1.28-1.28zm7.81 2.29C19.17 8.13 15.79 6 12 6c-.68 0-1.34.09-1.99.22l.92.92c.35-.09.7-.14 1.07-.14 2.48 0 4.5 2.02 4.5 4.5 0 .37-.06.72-.14 1.07l2.05 2.05c.98-.86 1.81-1.91 2.41-3.12zM12 17c.95 0 1.87-.13 2.75-.39l-.98-.98c-.54.24-1.14.37-1.77.37-2.48 0-4.5-2.02-4.5-4.5 0-.63.13-1.23.36-1.77L6.11 7.97c-1.22.91-2.23 2.1-2.93 3.52C4.83 14.86 8.21 17 12 17z"
        opacity=".3"
      />
      <path d="M12 6c3.79 0 7.17 2.13 8.82 5.5-.59 1.22-1.42 2.27-2.41 3.12l1.41 1.41c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.11 17 4 12 4c-1.27 0-2.49.2-3.64.57l1.65 1.65C10.66 6.09 11.32 6 12 6zm2.28 4.49l2.07 2.07c.08-.34.14-.7.14-1.07C16.5 9.01 14.48 7 12 7c-.37 0-.72.06-1.07.14L13 9.21c.58.25 1.03.71 1.28 1.28zM2.01 3.87l2.68 2.68C3.06 7.83 1.77 9.53 1 11.5 2.73 15.89 7 19 12 19c1.52 0 2.98-.29 4.32-.82l3.42 3.42 1.41-1.41L3.42 2.45 2.01 3.87zm7.5 7.5l2.61 2.61c-.04.01-.08.02-.12.02-1.38 0-2.5-1.12-2.5-2.5 0-.05.01-.08.01-.13zm-3.4-3.4l1.75 1.75c-.23.55-.36 1.15-.36 1.78 0 2.48 2.02 4.5 4.5 4.5.63 0 1.23-.13 1.77-.36l.98.98c-.88.24-1.8.38-2.75.38-3.79 0-7.17-2.13-8.82-5.5.7-1.43 1.72-2.61 2.93-3.53z" />
    </svg>
  ),
  statistics: "bar_chart",
  audit: iconObject(
    <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24">
      <g>
        <rect fill="none" height="24" width="24" />
      </g>
      <g>
        <g>
          <g opacity=".3">
            <path d="M11.34,9.76L9.93,8.34C8.98,7.4,7.73,6.88,6.39,6.88C5.76,6.88,5.14,7,4.57,7.22l1.04,1.04h2.28v2.14 c0.4,0.23,0.86,0.35,1.33,0.35c0.73,0,1.41-0.28,1.92-0.8L11.34,9.76z" />
          </g>
          <g opacity=".3">
            <path d="M11,6.62l6,5.97V14h-1.41l-2.83-2.83l-0.2,0.2c-0.46,0.46-0.99,0.8-1.56,1.03V15h6v2c0,0.55,0.45,1,1,1s1-0.45,1-1V6h-8 V6.62z" />
          </g>
          <g>
            <path d="M9,4v1.38c-0.83-0.33-1.72-0.5-2.61-0.5c-1.79,0-3.58,0.68-4.95,2.05l3.33,3.33h1.11v1.11c0.86,0.86,1.98,1.31,3.11,1.36 V15H6v3c0,1.1,0.9,2,2,2h10c1.66,0,3-1.34,3-3V4H9z M7.89,10.41V8.26H5.61L4.57,7.22C5.14,7,5.76,6.88,6.39,6.88 c1.34,0,2.59,0.52,3.54,1.46l1.41,1.41l-0.2,0.2c-0.51,0.51-1.19,0.8-1.92,0.8C8.75,10.75,8.29,10.63,7.89,10.41z M19,17 c0,0.55-0.45,1-1,1s-1-0.45-1-1v-2h-6v-2.59c0.57-0.23,1.1-0.57,1.56-1.03l0.2-0.2L15.59,14H17v-1.41l-6-5.97V6h8V17z" />
          </g>
        </g>
      </g>
    </svg>
  ),
  users: iconObject(
    <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24">
      <g>
        <rect fill="none" height="24" width="24" />
      </g>
      <g>
        <g>
          <path
            d="M16,7.58l-5.5-2.4L5,7.58v3.6c0,3.5,2.33,6.74,5.5,7.74c0.25-0.08,0.49-0.2,0.73-0.3 C11.08,18.11,11,17.56,11,17c0-2.97,2.16-5.43,5-5.91V7.58z"
            opacity=".3"
          />
          <path
            d="M17,13c-2.21,0-4,1.79-4,4c0,2.21,1.79,4,4,4s4-1.79,4-4C21,14.79,19.21,13,17,13z M17,14.38 c0.62,0,1.12,0.51,1.12,1.12s-0.51,1.12-1.12,1.12s-1.12-0.51-1.12-1.12S16.38,14.38,17,14.38z M17,19.75 c-0.93,0-1.74-0.46-2.24-1.17c0.05-0.72,1.51-1.08,2.24-1.08s2.19,0.36,2.24,1.08C18.74,19.29,17.93,19.75,17,19.75z"
            opacity=".3"
          />
          <circle cx="17" cy="15.5" r="1.12" />
          <path d="M18,11.09V6.27L10.5,3L3,6.27v4.91c0,4.54,3.2,8.79,7.5,9.82c0.55-0.13,1.08-0.32,1.6-0.55C13.18,21.99,14.97,23,17,23 c3.31,0,6-2.69,6-6C23,14.03,20.84,11.57,18,11.09z M11,17c0,0.56,0.08,1.11,0.23,1.62c-0.24,0.11-0.48,0.22-0.73,0.3 c-3.17-1-5.5-4.24-5.5-7.74v-3.6l5.5-2.4l5.5,2.4v3.51C13.16,11.57,11,14.03,11,17z M17,21c-2.21,0-4-1.79-4-4c0-2.21,1.79-4,4-4 s4,1.79,4,4C21,19.21,19.21,21,17,21z" />
          <path d="M17,17.5c-0.73,0-2.19,0.36-2.24,1.08c0.5,0.71,1.32,1.17,2.24,1.17s1.74-0.46,2.24-1.17C19.19,17.86,17.73,17.5,17,17.5z" />
        </g>
      </g>
    </svg>
  ),
  images: iconObject(
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M8 16h12V4H8v12zm3.5-4.33l1.69 2.26 2.48-3.09L19 15H9l2.5-3.33z" opacity=".3" />
      <path d="M8 2c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H8zm12 14H8V4h12v12zm-4.33-5.17l-2.48 3.09-1.69-2.25L9 15h10zM4 22h14v-2H4V6H2v14c0 1.1.9 2 2 2z" />
    </svg>
  ),
  settings: iconObject(
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path
        d="M19.28 8.6l-.7-1.21-1.27.51-1.06.43-.91-.7c-.39-.3-.8-.54-1.23-.71l-1.06-.43-.16-1.13L12.7 4h-1.4l-.19 1.35-.16 1.13-1.06.44c-.41.17-.82.41-1.25.73l-.9.68-1.05-.42-1.27-.52-.7 1.21 1.08.84.89.7-.14 1.13c-.03.3-.05.53-.05.73s.02.43.05.73l.14 1.13-.89.7-1.08.84.7 1.21 1.27-.51 1.06-.43.91.7c.39.3.8.54 1.23.71l1.06.43.16 1.13.19 1.36h1.39l.19-1.35.16-1.13 1.06-.43c.41-.17.82-.41 1.25-.73l.9-.68 1.04.42 1.27.51.7-1.21-1.08-.84-.89-.7.14-1.13c.04-.31.05-.52.05-.73 0-.21-.02-.43-.05-.73l-.14-1.13.89-.7 1.1-.84zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        opacity=".3"
      />
      <path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    </svg>
  ),
};

export const pageSort: { [key: string]: string } = {
  calendar: "gbLaunch",
  live: "gbEnd",
  ic: "icDate",
  previous: "gbEnd",
  timeline: "gbLaunch",
  archive: "profile",
  favorites: "profile",
  hidden: "profile",
};

export const pageSortOrder: { [key: string]: SortOrderType } = {
  calendar: "ascending",
  live: "ascending",
  ic: "descending",
  previous: "descending",
  timeline: "ascending",
  archive: "ascending",
  favorites: "ascending",
  hidden: "ascending",
};

export const reverseSortDatePages = ["ic", "previous"];

export const sortNames: { [key: string]: string } = {
  profile: "Profile",
  designer: "Designer",
  vendor: "Vendor",
  icDate: "IC date",
  gbLaunch: "Start date",
  gbEnd: "End date",
};

export const sortBlacklist: { [key: string]: string[] } = {
  profile: [],
  designer: [],
  vendor: ["ic", "archive", "favorites", "hidden"],
  icDate: [],
  gbLaunch: ["ic", "archive", "favorites", "hidden"],
  gbEnd: ["ic", "timeline", "archive", "favorites", "hidden"],
};

export const dateSorts = ["icDate", "gbLaunch", "gbEnd"];

export const arraySorts = ["designer"];

export const whitelistShipped: string[] = ["Shipped", "Not shipped"];

export const whitelistParams: string[] = ["profile", "profiles", "shipped", "vendorMode", "vendors"];

export const statsTabs: string[] = ["timeline", "status", "shipped", "duration", "vendors"];

export const viewNames: { [key: string]: string } = {
  card: "Card",
  list: "List",
  imageList: "Image List",
  compact: "Compact",
};

export const viewIcons: { [key: string]: RMWC.IconPropT } = {
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
