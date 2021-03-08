import React from "react";

/* eslint-disable @typescript-eslint/no-empty-function */

export const UserContext = React.createContext({
  user: {
    email: null,
    name: null,
    avatar: null,
    nickname: "",
    isDesigner: false,
    isEditor: false,
    isAdmin: false,
    id: null,
  },
  setUser: () => {},
  favorites: [],
  toggleFavorite: () => {},
  hidden: [],
  toggleHide: () => {},
  syncSettings: false,
  setSyncSettings: () => {},
  preset: {},
  presets: [],
  selectPreset: () => {},
  newPreset: () => {},
  editPreset: () => {},
  deletePreset: () => {},
});

UserContext.displayName = "User";

export const DeviceContext = React.createContext("desktop");

DeviceContext.displayName = "Device";
