import React from "react";
import { UserRoles } from "./types";
import { IconPropT } from "@rmwc/types";
import { iconObject } from "@s/util/functions";

export const userRoles = ["designer", "editor", "admin"] as const;

export const formattedUserRoles: Record<UserRoles, string> = {
  designer: "Designer",
  editor: "Editor",
  admin: "Admin",
};

export const userRoleIcons: Record<UserRoles, IconPropT> = {
  designer: iconObject(
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path
        d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5 0-.16-.08-.28-.14-.35-.41-.46-.63-1.05-.63-1.65 0-1.38 1.12-2.5 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 10 6.5 10s1.5.67 1.5 1.5S7.33 13 6.5 13zm3-4C8.67 9 8 8.33 8 7.5S8.67 6 9.5 6s1.5.67 1.5 1.5S10.33 9 9.5 9zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 6 14.5 6s1.5.67 1.5 1.5S15.33 9 14.5 9zm4.5 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"
        opacity=".3"
      />
      <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.21-.64-1.67-.08-.09-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm4 13h-1.77c-1.38 0-2.5 1.12-2.5 2.5 0 .61.22 1.19.63 1.65.06.07.14.19.14.35 0 .28-.22.5-.5.5-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.14 8 7c0 2.21-1.79 4-4 4z" />
      <circle cx="6.5" cy="11.5" r="1.5" />
      <circle cx="9.5" cy="7.5" r="1.5" />
      <circle cx="14.5" cy="7.5" r="1.5" />
      <circle cx="17.5" cy="11.5" r="1.5" />
    </svg>
  ),
  editor: iconObject(
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M5 18.08V19h.92l9.06-9.06-.92-.92z" opacity=".3" />
      <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19z" />
    </svg>
  ),
  admin: iconObject(
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="24px" height="24px">
      <path fill="none" d="M0,0h18v18H0V0z" />
      <path
        d="M9,0.8l-6.8,3v4.5c0,4.2,2.9,8.1,6.8,9c3.9-0.9,6.8-4.8,6.8-9V3.8L9,0.8z M14.3,8.3c0,3.4-2.2,6.5-5.3,7.4
  c-3-0.9-5.3-4.1-5.3-7.4V4.7L9,2.4l5.3,2.3V8.3z"
      />
      <path opacity="0.3" d="M3.8,4.7v3.5c0,3.4,2.2,6.5,5.3,7.4c3-0.9,5.3-4.1,5.3-7.4V4.7L9,2.4L3.8,4.7z" />
    </svg>
  ),
};
