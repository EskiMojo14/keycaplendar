import React from "react";
import { IconPropT } from "@rmwc/types";
import { iconObject } from "./functions";

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
        <path d="M3,4H5V10H9V4H11V18H9V12H5V18H3V4M14,18V16H16V6.31L13.5,7.75V5.44L16,4H18V16H20V18H14Z" />
      </svg>
    </div>
  ),
  h2: iconObject(
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M3,4H5V10H9V4H11V18H9V12H5V18H3V4M21,18H15A2,2 0 0,1 13,16C13,15.47 13.2,15 13.54,14.64L18.41,9.41C18.78,9.05 19,8.55 19,8A2,2 0 0,0 17,6A2,2 0 0,0 15,8H13A4,4 0 0,1 17,4A4,4 0 0,1 21,8C21,9.1 20.55,10.1 19.83,10.83L15,16H21V18Z" />
      </svg>
    </div>
  ),
  h3: iconObject(
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M3,4H5V10H9V4H11V18H9V12H5V18H3V4M15,4H19A2,2 0 0,1 21,6V16A2,2 0 0,1 19,18H15A2,2 0 0,1 13,16V15H15V16H19V12H15V10H19V6H15V7H13V6A2,2 0 0,1 15,4Z" />
      </svg>
    </div>
  ),
  h4: iconObject(
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M3,4H5V10H9V4H11V18H9V12H5V18H3V4M18,18V13H13V11L18,4H20V11H21V13H20V18H18M18,11V7.42L15.45,11H18Z" />
      </svg>
    </div>
  ),
  h5: iconObject(
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        version="1.1"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path d="M3,4H5V10H9V4H11V18H9V12H5V18H3V4M15,4H20V6H15V10H17A4,4 0 0,1 21,14A4,4 0 0,1 17,18H15A2,2 0 0,1 13,16V15H15V16H17A2,2 0 0,0 19,14A2,2 0 0,0 17,12H15A2,2 0 0,1 13,10V6A2,2 0 0,1 15,4Z" />
      </svg>
    </div>
  ),
  h6: iconObject(
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        version="1.1"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path d="M3,4H5V10H9V4H11V18H9V12H5V18H3V4M15,4H19A2,2 0 0,1 21,6V7H19V6H15V10H19A2,2 0 0,1 21,12V16A2,2 0 0,1 19,18H15A2,2 0 0,1 13,16V6A2,2 0 0,1 15,4M15,12V16H19V12H15Z" />
      </svg>
    </div>
  ),
};
