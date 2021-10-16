import { UserRoles } from "./types";
import { IconPropT } from "@rmwc/types";
import { iconObject } from "@s/util/functions";
import { Edit, Palette, Shield } from "@i";

export const userRoles = ["designer", "editor", "admin"] as const;

export const formattedUserRoles: Record<UserRoles, string> = {
  designer: "Designer",
  editor: "Editor",
  admin: "Admin",
};

export const userRoleIcons: Record<UserRoles, IconPropT> = {
  designer: iconObject(<Palette />),
  editor: iconObject(<Edit />),
  admin: iconObject(<Shield />),
};
