import type { userRoles } from "./constants";

export type UserType = {
  admin: boolean;
  dateCreated: string;
  designer: boolean;
  displayName: string;
  editor: boolean;
  email: string;
  id: string;
  lastActive: string;
  lastSignIn: string;
  nickname: string;
  photoURL: string;
};

export type UserRoles = typeof userRoles[number];
