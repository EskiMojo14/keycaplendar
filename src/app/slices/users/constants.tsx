import type { IconPropT } from "@rmwc/types";
import { iconObject } from "@s/util/functions";
import { Edit, Palette, Shield, ViewArray, ViewList } from "@i";

export const userRoles = ["designer", "editor", "admin"] as const;

export const formattedUserRoles: Record<typeof userRoles[number], string> = {
  designer: "Designer",
  editor: "Editor",
  admin: "Admin",
};

export const userRoleIcons: Record<typeof userRoles[number], IconPropT> = {
  designer: iconObject(<Palette />),
  editor: iconObject(<Edit />),
  admin: iconObject(<Shield />),
};

export const views = ["card", "table"] as const;

export const viewLabels: Record<typeof views[number], string> = {
  card: "Card",
  table: "Table",
};

export const viewIcons: Record<typeof views[number], IconPropT> = {
  card: iconObject(<ViewArray />),
  table: iconObject(<ViewList />),
};

export const sortProps = [
  "displayName",
  "email",
  "dateCreated",
  "lastSignIn",
  "lastActive",
  "nickname",
  "designer",
  "editor",
  "admin",
] as const;

export const sortLabels: Record<typeof sortProps[number], string> = {
  displayName: "Name",
  email: "Email",
  dateCreated: "Date created",
  lastSignIn: "Last sign in",
  lastActive: "Last active",
  nickname: "Nickname",
  designer: "Designer",
  editor: "Editor",
  admin: "Admin",
};
