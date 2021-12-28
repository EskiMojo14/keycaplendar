import type { userRoles } from "./constants";

export type UserType = {
  admin: boolean;
  designer: boolean;
  displayName: string;
  editor: boolean;
  email: string;
  nickname: string;
  photoURL: string;
  dateCreated: string;
  lastSignIn: string;
  lastActive: string;
};

export type UserRoles = typeof userRoles[number];
