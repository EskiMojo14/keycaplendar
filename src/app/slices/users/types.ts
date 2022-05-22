import type { userRoles } from "./constants";

export type CustomClaims = {
  admin: boolean;
  designer: boolean;
  editor: boolean;
  nickname: string;
};

export type UserType = CustomClaims & {
  dateCreated: string;
  displayName: string;
  editor: boolean;
  email: string;
  id: string;
  lastActive: string;
  lastSignIn: string;
  photoURL: string;
};

export type UserRoles = typeof userRoles[number];
