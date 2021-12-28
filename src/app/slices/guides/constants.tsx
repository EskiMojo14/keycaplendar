import type { IconPropT } from "@rmwc/types";
import { formattedUserRoles, userRoleIcons, userRoles } from "@s/users/constants";
import { iconObject } from "@s/util/functions";
import { Public } from "@i";
import type { Visibility } from "./types";

export const visibilityVals = ["all", ...userRoles] as const;

export const formattedVisibility: Record<Visibility, string> = {
  all: "All",
  ...formattedUserRoles,
};

export const visibilityIcons: Record<Visibility, IconPropT> = {
  all: iconObject(<Public />),
  ...userRoleIcons,
};
