import React from "react";
import { IconPropT } from "@rmwc/types";
import { iconObject } from "@s/util/functions";

export const markdownIcons: Record<string, IconPropT> = {
  header: "title",
  bold: "format_bold",
  italic: "format_italic",
  strikethrough: "strikethrough_s",
  link: "link",
  quote: "format_quote",
  code: "code",
  image: iconObject(
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M5 19h14V5H5v14zm4-5.86l2.14 2.58 3-3.87L18 17H6l3-3.86z" opacity=".3" />
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-4.86-7.14l-3 3.86L9 13.14 6 17h12z" />
      </svg>
    </div>
  ),
  "unordered-list": "format_list_bulleted",
  "ordered-list": "format_list_numbered",
  "checked-list": "checklist",
  h1: iconObject(
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M3,4H5V10H9V4H11V18H9V12H5V18H3V4M14,18V16H16V6.31L13.5,7.75V5.44L16,4H18V16H20V18H14Z" />
      </svg>
    </div>
  ),
  h2: iconObject(
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M3,4H5V10H9V4H11V18H9V12H5V18H3V4M21,18H15A2,2 0 0,1 13,16C13,15.47 13.2,15 13.54,14.64L18.41,9.41C18.78,9.05 19,8.55 19,8A2,2 0 0,0 17,6A2,2 0 0,0 15,8H13A4,4 0 0,1 17,4A4,4 0 0,1 21,8C21,9.1 20.55,10.1 19.83,10.83L15,16H21V18Z" />
      </svg>
    </div>
  ),
  h3: iconObject(
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M3,4H5V10H9V4H11V18H9V12H5V18H3V4M15,4H19A2,2 0 0,1 21,6V16A2,2 0 0,1 19,18H15A2,2 0 0,1 13,16V15H15V16H19V12H15V10H19V6H15V7H13V6A2,2 0 0,1 15,4Z" />
      </svg>
    </div>
  ),
  h4: iconObject(
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M3,4H5V10H9V4H11V18H9V12H5V18H3V4M18,18V13H13V11L18,4H20V11H21V13H20V18H18M18,11V7.42L15.45,11H18Z" />
      </svg>
    </div>
  ),
  h5: iconObject(
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M3,4H5V10H9V4H11V18H9V12H5V18H3V4M15,4H20V6H15V10H17A4,4 0 0,1 21,14A4,4 0 0,1 17,18H15A2,2 0 0,1 13,16V15H15V16H17A2,2 0 0,0 19,14A2,2 0 0,0 17,12H15A2,2 0 0,1 13,10V6A2,2 0 0,1 15,4Z" />
      </svg>
    </div>
  ),
  h6: iconObject(
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M3,4H5V10H9V4H11V18H9V12H5V18H3V4M15,4H19A2,2 0 0,1 21,6V7H19V6H15V10H19A2,2 0 0,1 21,12V16A2,2 0 0,1 19,18H15A2,2 0 0,1 13,16V6A2,2 0 0,1 15,4M15,12V16H19V12H15Z" />
      </svg>
    </div>
  ),
  "insert-table": iconObject(
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M0,0H24V24H0Z" fill="none" />
        <path d="M18,11H12V7h6ZM4,17h6V13H4Zm11.69-4H12v4h1.09A6,6,0,0,1,15.69,13ZM4,11h6V7H4Z" opacity=".3" />
        <path d="M18,14h2v3h3v2H20v3H18V19H15V17h3V14M4,3H18a2,2,0,0,1,2,2v7.08a6,6,0,0,0-4.32.92H12v4h1.08a6.1,6.1,0,0,0,0,2H4a2,2,0,0,1-2-2V5A2,2,0,0,1,4,3M4,7v4h6V7H4m8,0v4h6V7H12M4,13v4h6V13Z" />
      </svg>
    </div>
  ),
  "column-after": iconObject(
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M0,0H24V24H0Z" fill="none" />
        <path d="M11,14H4V10h7Zm0,2H4v4h7ZM4,8h7V4H4Z" opacity=".3" />
        <path d="M11,2a2,2,0,0,1,2,2V20a2,2,0,0,1-2,2H2V2h9M4,10v4h7V10H4m0,6v4h7V16H4M4,4V8h7V4H4m11,7h3V8h2v3h3v2H20v3H18V13H15Z" />
      </svg>
    </div>
  ),
};
