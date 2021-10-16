import { Visibility } from "./types";
import { formattedUserRoles, userRoleIcons, userRoles } from "@s/users/constants";
import { iconObject } from "@s/util/functions";
import { IconPropT } from "@rmwc/types";
import { Public } from "@i";

export const visibilityVals = ["all", ...userRoles] as const;

export const formattedVisibility: Record<Visibility, string> = {
  all: "All",
  ...formattedUserRoles,
};

export const visibilityIcons: Record<Visibility, IconPropT> = {
  all: iconObject(<Public />),
  ...userRoleIcons,
};
