import type { IconPropT } from "@rmwc/types";
import { iconObject } from "@s/util/functions";
import { Edit, Palette, Shield, ViewArray, ViewList } from "@i";
import type { UserType } from "./types";

export const blankUser: UserType = {
  admin: false,
  dateCreated: "",
  designer: false,
  displayName: "",
  editor: false,
  email: "",
  id: "",
  lastActive: "",
  lastSignIn: "",
  nickname: "",
  photoURL: "",
};

export const userRoles = ["designer", "editor", "admin"] as const;

export const formattedUserRoles: Record<typeof userRoles[number], string> = {
  admin: "Admin",
  designer: "Designer",
  editor: "Editor",
};

export const userRoleIcons: Record<typeof userRoles[number], IconPropT> = {
  admin: iconObject(<Shield />),
  designer: iconObject(<Palette />),
  editor: iconObject(<Edit />),
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
  admin: "Admin",
  dateCreated: "Date created",
  designer: "Designer",
  displayName: "Name",
  editor: "Editor",
  email: "Email",
  lastActive: "Last active",
  lastSignIn: "Last sign in",
  nickname: "Nickname",
};
